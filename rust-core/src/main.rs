use axum::{
    routing::get,
    Json, Router,
};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing_subscriber;

#[derive(Serialize)]
struct SalamResponse {
    message: String,
    service: String,
    version: String,
    status: String,
}

async fn salam() -> Json<SalamResponse> {
    Json(SalamResponse {
        message: "Assalamu'alaikum dari Aumo Core (Rust)".to_string(),
        service: "aumo-core".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        status: "ready".to_string(),
    })
}

async fn health() -> &'static str {
    "ok"
}

#[tokio::main]
async fn main() {
    // Logging sederhana
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(salam))
        .route("/salam", get(salam))
        .route("/health", get(health))
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    tracing::info!("Aumo Core (Rust) listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
