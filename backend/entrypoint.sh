#!/bin/sh
# Jalankan binary axum di background
/app/axum_service &

# Jalankan ASP.NET Core di foreground
exec dotnet AumoBackend.dll
