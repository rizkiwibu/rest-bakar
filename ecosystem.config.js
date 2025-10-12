module.exports = {
  apps: [
    {
      name: "server", // Nama aplikasi
      script: "nodemon", // Menjalankan nodemon
      args: "src/server.js", // File entry point server
      watch: true, // Pantau perubahan file
      interpreter: "node", // Pastikan interpreter yang digunakan adalah node
      env: {
        NODE_ENV: "development" // Menentukan environment untuk nodemon
      }
    }
  ]
};

