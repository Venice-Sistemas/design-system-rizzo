/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sem `transpilePackages`: o pacote é consumido já construído, como uma
  // aplicação real o consumiria. Precisar de transpilação aqui seria sinal de que
  // o build do pacote está entregando algo que o consumidor não roda direto.
};

export default nextConfig;
