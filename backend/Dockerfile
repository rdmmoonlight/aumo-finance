# 1. Stage Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# 2. Stage Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install EF Core CLI Tool di stage build
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy csproj dan restore (Caching layer)
COPY ["AumoBackend.csproj", "./"]
RUN dotnet restore "AumoBackend.csproj"

# Copy seluruh source code backend
COPY . .

# Publish aplikasi
RUN dotnet publish "AumoBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 3. Stage Migration Runner (Khusus untuk Update Database Manual via Docker)
FROM build AS migration-runner
ENTRYPOINT ["dotnet", "ef", "database", "update"]

# 4. Stage Final (App Production)
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "AumoBackend.dll"]
