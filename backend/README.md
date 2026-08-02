# Chinese Learning Backend

ASP.NET Core 8 Web API theo Clean Architecture, phục vụ frontend Next.js của Chinese Learning System.

## Cấu trúc

- `ChineseLearning.Api`: HTTP API, OpenAPI, middleware và health checks.
- `ChineseLearning.Application`: use cases và abstraction.
- `ChineseLearning.Domain`: entity và business rules thuần.
- `ChineseLearning.Infrastructure`: EF Core, PostgreSQL và external services.
- `tests`: unit và integration tests.

## Chạy local

Yêu cầu .NET SDK 8.

```bash
dotnet restore ChineseLearning.sln
dotnet build ChineseLearning.sln --configuration Release --no-restore
dotnet test ChineseLearning.sln --configuration Release --no-build
dotnet run --project src/ChineseLearning.Api
```

Swagger: `http://localhost:8080/swagger`

Health checks:

- `GET /health/live`
- `GET /health/ready`

## Docker

```bash
docker build -t chinese-learning-api .
docker run --rm -p 8080:8080 chinese-learning-api
```

Không commit connection string, Supabase service role key hoặc OpenAI API key. Cấu hình bí mật phải được cung cấp bằng biến môi trường của môi trường chạy.
