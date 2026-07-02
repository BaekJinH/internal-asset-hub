import React from 'react'

export interface ContactFormProps {
  onSubmit: (value: string) => void
  placeholder: string
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, placeholder }) => (
  <form className="sm:grid gap-4" aria-label="contact form">
    <input className="input" placeholder={placeholder} aria-required="true" />
    <button type="submit">Send</button>
  </form>
)
