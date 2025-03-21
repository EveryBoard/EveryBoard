use tokio::net::TcpListener;
use tokio_tungstenite::accept_hdr_async;
use tokio_tungstenite::tungstenite::http::StatusCode;
use tokio_tungstenite::tungstenite::protocol::Message;
use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::handshake::server::{Request, Response, ErrorResponse};
use tokio_tungstenite::tungstenite::http::header::SEC_WEBSOCKET_PROTOCOL;

#[tokio::main]
async fn main() -> Result<()> {
    let addr = "127.0.0.1:8080".to_string();
    let listener = TcpListener::bind(&addr).await?;
    println!("WebSocket server started on ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(stream));
    }

    Ok(())
}

async fn handle_connection(stream: tokio::net::TcpStream) -> Result<()> {
    println!("Got connection!");
    let callback = |request: &Request, mut response: Response| -> Result<Response, ErrorResponse> {
        if request.headers().contains_key(SEC_WEBSOCKET_PROTOCOL) == false {
            let mut response: ErrorResponse = ErrorResponse::default();
            *response.status_mut() = StatusCode::UNAUTHORIZED;
            return Err(response);
        }

        Ok(response)
    };

    let mut ws_stream = accept_hdr_async(stream, callback).await?;
    println!("WebSocket connection established");

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
