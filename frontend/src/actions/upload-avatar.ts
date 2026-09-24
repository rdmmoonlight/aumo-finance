// actions/upload-avatar.ts
'use server';

import { supabase } from '@/lib/supabase';

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get('avatar') as File;

  // Validasi keberadaan file
  if (!file || file.size === 0) {
    return { error: 'File tidak boleh kosong' };
  }

  // Validasi batasan ukuran (maksimal 2MB)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { error: 'Ukuran file maksimal 2MB' };
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    return { error: 'File harus berupa gambar' };
  }

  // Buat nama file yang unik untuk menghindari penimpaan nama yang sama
  const fileExtension = file.name.split('.').pop();
  const fileName = `user-avatar-${Date.now()}.${fileExtension}`;
  const filePath = `${fileName}`;

  // Upload ke Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return { error: `Gagal mengunggah gambar: ${error.message}` };
  }

  // Dapatkan URL publik dari gambar yang baru diunggah
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return { 
    success: true, 
    url: publicUrlData.publicUrl 
  };
}