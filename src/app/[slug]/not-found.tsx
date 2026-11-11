export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-4 text-center text-[#1F1A17]">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#8C3B2B]">Menu Digital</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
        Ementa indisponível ou não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#655950]">
        Este restaurante pode ainda não ter publicado a sua carta ou o endereço foi alterado.
      </p>
    </div>
  );
}
