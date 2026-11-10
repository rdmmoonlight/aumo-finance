#pragma once

#include <string>

// Rujukan tabel (schema + nama) dengan quoting identifier PostgreSQL yang aman.
struct TableRef {
    std::string schema;
    std::string name;

    static std::string quoteIdent(const std::string& ident) {
        std::string out = "\"";
        for (char c : ident) {
            if (c == '"') out += '"';
            out += c;
        }
        out += '"';
        return out;
    }

    std::string quoted() const { return quoteIdent(schema) + "." + quoteIdent(name); }
};
