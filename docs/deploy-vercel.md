# Despliegue En Vercel

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En Vercel, selecciona **Add New Project** e importa el repositorio.
3. Configura:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. En **Settings > Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_NAME`
5. En Supabase Auth, entra a **Authentication > URL Configuration**:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: `https://tu-dominio.vercel.app/*`
6. Despliega. Cada push a la rama principal generará un nuevo deploy.
