// import { defineConfig } from 'vite';
// import { resolve } from 'path';

// export default defineConfig({
//   root: 'src',
//   build: {
//     outDir: '../dist',
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, 'src/index.html'),
//         login: resolve(__dirname, 'src/login.html'),
//         signup: resolve(__dirname, 'src/sign_up.html'),
//         dashboard: resolve(__dirname, 'src/dashboard.html'),
//       }
//     }
//   },
//   server: {
//     port: 3000,
//     open: true
//   }
// });
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'sign up.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
