FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY global.json ./
COPY src/Portfolio.Web/Portfolio.Web.csproj src/Portfolio.Web/
RUN dotnet restore src/Portfolio.Web/Portfolio.Web.csproj
COPY src/Portfolio.Web/ src/Portfolio.Web/
RUN dotnet publish src/Portfolio.Web/Portfolio.Web.csproj -c Release --no-restore -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
USER $APP_UID
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["dotnet", "Portfolio.Web.dll"]
