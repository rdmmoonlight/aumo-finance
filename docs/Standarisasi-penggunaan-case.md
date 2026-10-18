​Standardisasi Casing Proyek .NET
​Di ekosistem .NET, aturan casing sebenarnya sangat konsisten dan sudah dipatenkan secara resmi oleh Microsoft melalui Framework Design Guidelines. Berikut pembagian standar resminya:
​PascalCase (C# & Visual Studio standard):
​Nama Solusi & Proyek: MyApplication.sln, MyApplication.Api.csproj
​Nama Folder & File .cs: Controllers/UserController.cs, Services/AuthService.cs
​Nama Class, Interface, Method, & Property: public class UserService, public string FirstName { get; set; }
​kebab-case (OS, Web, & File System standard):
​Routing URL REST API: /api/user-profiles (diatur via route attribute atau slug generator)
​Nama file non-C# (misal: JSON, YAML, Docker): appsettings.json, docker-compose.yml
​snake_case (Database standard):
​Nama tabel dan kolom di PostgreSQL/MySQL: user_profiles, first_name
