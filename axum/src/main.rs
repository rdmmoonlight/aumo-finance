use axum::{routing::get, Router};
use std::env;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "Hello, World!" }));

    // Ambil PORT dari environment Render, default ke 10000
    let port = env::var("PORT").unwrap_or_else(|_| "10000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap();

    println!("Server berjalan di {}", addr);
    axum::serve(listener, app).await.unwrap();
}
