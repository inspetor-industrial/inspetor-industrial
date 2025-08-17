import { ContactForm } from './components/form'

export default async function Contact() {
  return (
    <main className="flex h-[calc(100vh-var(--navbar-height))] w-full flex-col items-center justify-start overflow-y-auto px-4 py-6 pb-20 max-md:pb-32 max-sm:pb-24 max-sm:px-3 max-sm:py-4">
      {/* Hero Section */}
      <div className="w-full max-w-[1280px] space-y-6 text-center max-sm:space-y-4">
        <h1 className="text-4xl font-bold leading-tight text-white max-sm:text-2xl max-sm:leading-snug">
          Entre em Contato
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/90 max-sm:text-base">
          Solicite um orçamento personalizado ou tire suas dúvidas sobre nossos
          serviços de inspeção industrial. Nossa equipe está pronta para
          atendê-lo.
        </p>
      </div>

      {/* Contact Form */}
      <div className="mt-8 w-full max-w-[880px] rounded-lg bg-white/10 p-8 shadow-2xl backdrop-blur-sm max-sm:mt-6 max-sm:p-6 max-sm:rounded-md">
        <ContactForm />
      </div>
    </main>
  )
}
