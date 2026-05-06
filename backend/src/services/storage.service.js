const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const uploadFile = async (fileBuffer, originalName, mimeType) => {
  if (!supabase) {
    throw new Error('Supabase configuration missing (SUPABASE_URL, SUPABASE_KEY)');
  }

  const fileName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from('attachments') // User must create this bucket in Supabase dashboard
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);

  return {
    url: publicUrlData.publicUrl,
    fileName,
  };
};

module.exports = { uploadFile };
