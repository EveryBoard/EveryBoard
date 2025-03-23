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
    let addr = "127.0.0.1:8081".to_string();
    let listener = TcpListener::bind(&addr).await?;
    println!("WebSocket server started on ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection_show_error(stream));
    }

    Ok(())
}

async fn handle_connection_show_error(stream: tokio::net::TcpStream) -> Result<()> {
    let result = handle_connection(stream).await;
    match result {
        Ok(ok) => Ok(ok),
        Err(error) => {
            println!("Error: {}", error);
            Err(error)
        }
    }
}

async fn handle_connection(stream: tokio::net::TcpStream) -> Result<()> {
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
                auth::extract_user_token(authorization_header)
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

    let uid_result = auth::verify_and_get_uid(&user_token).await;
    if let Err(error) = uid_result {
        let close_frame = CloseFrame {
            code: CloseCode::Normal,
            reason: "Authorization failed".into(),
        };
        ws_stream.send(Message::Close(Some(close_frame))).await?;
        return Err(anyhow::Error::msg(error));
    }

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
