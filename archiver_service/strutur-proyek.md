```
archiver-service/
├── CMakeLists.txt             # Script build/compile project
├── config.json                # Konfigurasi database & periode
├── include/                   # Header files (.hpp)
│   ├── Config.hpp             # Helper pembaca konfigurasi
│   ├── Database.hpp           # Wrapper koneksi database
│   └── ArchiverService.hpp    # Logika utama pengarsipan
└── src/                       # Implementation files (.cpp)
    ├── main.cpp               # Entry point aplikasi
    ├── Config.cpp
    ├── Database.cpp
    └── ArchiverService.cpp
