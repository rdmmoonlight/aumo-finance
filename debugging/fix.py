from typing import Any
from tailwind_merge import tw_merge


def cn(*args: Any) -> str:
    classes = []

    for arg in args:
        if not arg:
            continue

        # Jika input berupa string
        if isinstance(arg, str):
            classes.append(arg)

        # Jika input berupa list/tuple
        elif isinstance(arg, (list, tuple)):
            nested = cn(*arg)
            if nested:
                classes.append(nested)

        # Jika input berupa dictionary (mirip gaya clsx: {"bg-red-500": True})
        elif isinstance(arg, dict):
            for key, value in arg.items():
                if value:
                    classes.append(key)

    # Gabungin semua string lalu bersihkan bentrokan class pake tw_merge
    return tw_merge(" ".join(classes))


# --- CONTOH PENGGUNAAN ---

# 1. Menangani class bentrok (px-2 vs px-4 -> menang px-4)
print(cn("px-2 py-1 bg-red-500", "px-4"))
# Output: 'py-1 bg-red-500 px-4'

# 2. Kondisional dengan Dict/Kondisi Boolean
is_active = True
is_disabled = False

print(
    cn(
        "btn rounded",
        {"bg-blue-500": is_active, "opacity-50": is_disabled},
        "hover:bg-blue-600",
    )
)
# Output: 'btn rounded bg-blue-500 hover:bg-blue-600'

# 3. Menerima None / Empty string tanpa ngerusak hasil
print(cn("text-sm", None, "", "font-bold"))
# Output: 'text-sm font-bold'