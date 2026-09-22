# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Salin file proyek dan restore dependencies
COPY ["blazor2.csproj", "./"]
RUN dotnet restore "blazor2.csproj"

# Salin seluruh kode program dan lakukan publish
COPY . .
RUN dotnet publish "blazor2.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "blazor2.dll"]
