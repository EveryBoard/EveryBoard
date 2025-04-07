use std::sync::Arc;

use auth::user_retriever::{FirebaseUserRetriever, UserRetriever};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_hdr_async;
use tokio_tungstenite::tungstenite::http::StatusCode;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::{CloseFrame, Message};
use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::handshake::server::{Request, Response, ErrorResponse};
use tokio_tungstenite::tungstenite::http::header::SEC_WEBSOCKET_PROTOCOL;

mod auth;
pub mod config;
pub mod error;

#[tokio::main]
async fn main() -> Result<()> {
    config::check_config();
    let addr = config::get_addr();
    let listener = TcpListener::bind(&addr).await?;
    let service_account_file = config::get_service_account_file();
    let user_retriever = Arc::new(FirebaseUserRetriever::new(&service_account_file));
    println!("WebSocket server started on ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection_show_error(stream, Arc::clone(&user_retriever)));
    }

    Ok(())
}

async fn handle_connection_show_error(stream: tokio::net::TcpStream, user_retriever: Arc<dyn UserRetriever + Send + Sync>) -> Result<()> {
    let result = handle_connection(stream, user_retriever).await;
    match result {
        Ok(ok) => Ok(ok),
        Err(error) => {
            println!("Error: {}", error);
            Err(error)
        }
    }
}

async fn handle_connection<U: UserRetriever>(stream: tokio::net::TcpStream, user_retriever: U) -> Result<()> {
    println!("Got connection!");
    let mut user_token = String::new();
    let callback = |request: &Request, response: Response| -> Result<Response, ErrorResponse> {
        fn unauthorized() -> Result<Response, ErrorResponse> {
            let mut response: ErrorResponse = ErrorResponse::default();
            *response.status_mut() = StatusCode::UNAUTHORIZED;
            return Err(response);
        }
        match request.headers().get(SEC_WEBSOCKET_PROTOCOL) {
            Some(authorization_header) => {
                auth::jwt::extract_user_token(authorization_header)
                    .map(|token| {
                        user_token = token.to_string();
                        // response.headers_mut().insert(SEC_WEBSOCKET_PROTOCOL, HeaderValue::from_static("Authorization"));
                        return response;
                    })
                    .or_else(|_| unauthorized())
            },
            None => unauthorized()
        }
    };

    let mut ws_stream = accept_hdr_async(stream, callback).await?;
    println!("WebSocket connection established with token {:?}", user_token);

    let uid_result = auth::jwt::verify_and_get_uid(&user_token).await;
    if let Err(error) = uid_result {
        let close_frame = CloseFrame {
            code: CloseCode::Normal,
            reason: "Authorization failed".into(),
        };
        ws_stream.send(Message::Close(Some(close_frame))).await?;
        return Err(anyhow::Error::msg(error));
    }


    // TODO: get firebase user (do we need to?!) probably for minimal user (uid+name)
    // -> need a tokenrefresher to manage admin token
    // -> need to do a get request

    println!("uid is {}", uid_result?);
    while let Some(msg) = ws_stream.next().await {
        let msg = msg?;
        if msg.is_text() {
            let received_text = msg.to_text()?;
            println!("Received message: {}", received_text);
            ws_stream.send(Message::Text(received_text.to_string())).await?;
        }
    }

    println!("Lost client");
    Ok(())
}
