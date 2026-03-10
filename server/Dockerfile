# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY RecipeBoxServer/RecipeBoxServer.csproj RecipeBoxServer/
RUN dotnet restore RecipeBoxServer/RecipeBoxServer.csproj

COPY RecipeBoxServer/ RecipeBoxServer/
WORKDIR /src/RecipeBoxServer
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "RecipeBoxServer.dll"]
