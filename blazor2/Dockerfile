# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file .csproj dan lakukan restore dependency (mengoptimalkan caching layer Docker)
COPY *.csproj ./
RUN dotnet restore

# Copy seluruh sisa file di dalam folder blazor2 dan build/publish aplikasi
COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Environment
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Sesuaikan PORT jika platform Anda (seperti Render / Cloud Run) menyediakan environment variable PORT
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Ganti 'NamaProjectAnda.dll' sesuai dengan nama output assembly / .csproj Anda
ENTRYPOINT ["dotnet", "AumoBlazor.dll"]
