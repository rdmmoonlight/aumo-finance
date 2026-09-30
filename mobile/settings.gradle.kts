pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Tidak memakai jcenter() dengan sengaja — JCenter sudah dimatikan
        // total sejak Februari 2022, semua request ke sana gagal.
    }
}
rootProject.name = "AumoFinance"
include(":app")
