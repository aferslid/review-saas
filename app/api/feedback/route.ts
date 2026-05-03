import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { rating, message, slug } = body

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'aferslidou@gmail.com',
      subject: `${body.type === 'positive_copied' ? 'Avis positif copié' : 'Retour négatif'} - ${slug}`,
      html: `
        <h2>Nouvel avis reçu</h2>
        <p><strong>Business:</strong> ${slug}</p>
        <p><strong>Note:</strong> ${rating} ⭐</p>
        <p><strong>Message:</strong> ${message || 'Aucun'}</p>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error })
  }
}