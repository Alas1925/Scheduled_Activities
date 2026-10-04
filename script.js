const SUPABASE_URL = 'https://qxiufjlserfxgblftieb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_H0hMUqF1YM5rUT9cdLAqJA_qiQfNznA';

const { createClient } = supabase;
const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const form = document.querySelector('#login-form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const toggle = document.querySelector('.show-password');
const message = document.querySelector('#message');

toggle.addEventListener('click', () => {
  const isHidden = password.type === 'password';

  password.type = isHidden ? 'text' : 'password';
  toggle.textContent = isHidden ? 'Hide' : 'Show';
  toggle.setAttribute(
    'aria-label',
    isHidden ? 'Hide password' : 'Show password'
  );
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  message.textContent = 'Signing in...';
  message.classList.remove('error');

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    });

  if (error) {
    message.textContent = 'Incorrect email or password.';
    message.classList.add('error');
    console.error(error);
    return;
  }

  const { data: profile, error: profileError } =
    await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

  if (profileError) {
    message.textContent = 'Account role not found.';
    message.classList.add('error');
    console.error(profileError);
    return;
  }

  if (profile.role === 'admin') {
    message.textContent = 'Login successful. Welcome, Admin!';

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 500);

  } else if (profile.role === 'user') {
    message.textContent = 'Login successful. Welcome!';

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);

  } else {
    message.textContent = 'Invalid account role.';
    message.classList.add('error');
  }
});