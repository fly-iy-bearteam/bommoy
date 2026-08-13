// Khởi tạo Supabase Client
const SUPABASE_URL = 'https://fpiyoysdxosvgrjdufan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaXlveXNkeG9zdmdyamR1ZmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1ODI0MzUsImV4cCI6MjEwMjE1ODQzNX0.Mj0L-BMaXEEVzuLDX_flY-aUuy1US9GD7UBhIXWgTAI';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
