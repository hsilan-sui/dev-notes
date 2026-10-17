# Build context: backend/MyTide.Api
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY MyTide.Api.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DataDirectory=/data
# Run as the image's non-root user; the mounted /data volume must be writable by it.
RUN mkdir -p /data && chown app:app /data
USER app
EXPOSE 8080
VOLUME ["/data"]
ENTRYPOINT ["dotnet", "MyTide.Api.dll"]
