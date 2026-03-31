import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const verificationService = {
  /**
   * Upload ID document to Supabase Storage and create verification record
   */
  async submitVerification(userId: string, file: File) {
    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Nepodporovaný formát súboru. Povolené: JPG, PNG, WebP, PDF');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Súbor je príliš veľký. Maximum je 5MB.');
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Nepodarilo sa nahrať dokument. Skúste znova.');
    }

    // Get public URL (private bucket - only accessible via service role)
    const documentUrl = uploadData.path;

    // Create verification record
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_url: documentUrl,
        document_type: 'id_card',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Verification record error:', error);
      throw error;
    }

    // Update profile verification status
    await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', userId);

    return data;
  },

  /**
   * Get current verification status for a user
   */
  async getVerificationStatus(userId: string) {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Check if a user is verified
   */
  async isUserVerified(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', userId)
      .single();

    if (error) return false;
    return data?.is_verified || false;
  },
};
