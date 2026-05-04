'use client'

import { useState, use } from 'react'

export default function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const businesses: Record<string, { name: string; googleUrl: string }> = {
    'restaurant-test': {
      name: 'Restaurant Test',
      googleUrl: 'https://www.google.com',
    },
    'garage-dupont': {
      name: 'Garage Dupont',
      googleUrl: 'https://www.google.com',
    },
  }

  const business = businesses[slug]

  const [rating, setRating] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  const [locked, setLocked] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [reviewText, setReviewText] = useState('')

  const tags = [
    'Accueil chaleureux',
    'Service rapide',
    'Très bonne qualité',
    'Ambiance agréable',
    'Bon rapport qualité-prix',
    'Personnel attentionné',
  ]

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((item) => item !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const formatTag = (tag: string) => {
    return tag.charAt(0).toLowerCase() + tag.slice(1)
  }

  const generateReview = () => {
    if (selectedTags.length === 0) {
      return "Très bonne expérience, je recommande."
    }

    const openings = [
      "Très bonne expérience.",
      "Super moment.",
      "Excellente expérience.",
      "Franchement top.",
      "Je recommande vivement."
    ]

    const endings = [
      "Je recommande.",
      "Je reviendrai avec plaisir.",
      "À tester sans hésiter.",
      "Merci encore !",
      "Très satisfait."
    ]

    const opening = openings[Math.floor(Math.random() * openings.length)]
    const ending = endings[Math.floor(Math.random() * endings.length)]

    const formattedTags = selectedTags.map(tag => formatTag(tag))

    let middle = ""

    if (formattedTags.length === 1) {
      middle = `J’ai apprécié ${formattedTags[0]}.`
    } else if (formattedTags.length === 2) {
      middle = `J’ai apprécié ${formattedTags[0]} et ${formattedTags[1]}.`
    } else {
      middle = `J’ai apprécié ${formattedTags.slice(0, -1).join(", ")} et ${formattedTags.slice(-1)}.`
    }

    return `${opening} ${middle} ${ending}`
  }

  const copyReview = async () => {
    const finalReview = reviewText || generateReview()

    await navigator.clipboard.writeText(finalReview)

    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        rating,
        message: finalReview,
        slug,
        type: 'positive_copied',
        tags: selectedTags,
      }),
    })

    setCopied(true)
  }

  const sendFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        rating,
        message,
        slug,
      }),
    })

    setSent(true)
    setLocked(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6">
        <p className="text-center text-sm text-gray-500 mb-2">
          {business?.name || slug}
        </p>

        <h1 className="text-2xl font-bold text-center mb-2">
          Comment s’est passée votre expérience ?
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Votre retour nous aide énormément 🙏
        </p>

        <div className="flex justify-center gap-3 mb-3 mt-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => {
                if (!locked) {
                  setRating(num)
                  setLocked(true)
                }
              }}
              className={`text-4xl transition ${
                rating && num <= rating ? 'scale-110' : 'opacity-40'
              } ${locked ? 'cursor-not-allowed' : 'hover:scale-110'}`}
            >
              ⭐
            </button>
          ))}
        </div>

        {locked && !sent && (
          <button
            onClick={() => {
              setRating(null)
              setLocked(false)
              setSelectedTags([])
              setCopied(false)
            }}
            className="text-sm text-gray-500 underline mt-1 mb-2"
          >
            <p className="text-xs text-gray-500 hover:text-black mt-2">
              Mauvaise note ? Vous pouvez modifier
            </p>
          </button>
        )}

        {rating && rating >= 4 && (
          <div className="space-y-5">
            <div className="text-center mt-4">
              <p className="font-semibold mb-1">
                Merci beaucoup 🙏
              </p>
              <p className="text-sm text-gray-500">
                Pour vous faire gagner du temps, sélectionnez ce que vous avez aimé.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-full text-sm border ${
                    selectedTags.includes(tag)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {selectedTags.length === 0 && (
              <p className="text-xs text-gray-400 text-center -mt-2 mb-3">
                Sélectionnez quelques points pour une suggestion plus personnalisée.
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setReviewText(generateReview())}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-800 transition"
              >
                ✨ Générer une suggestion
              </button>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Votre avis apparaîtra ici..."
                className="w-full h-28 p-3 rounded-xl border bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <button
              onClick={copyReview}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold"
            >
              {copied ? 'Avis copié ✅ Maintenant collez-le sur Google Maps' : 'Copier l’avis'}
            </button>

            {copied && (
              <p className="text-center text-sm text-gray-500">
                Merci 🙏 Votre avis aide énormément les petits commerces à être visibles.
              </p>
            )}

            <a
              href={business?.googleUrl || 'https://www.google.com'}
              target="_blank"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Aller sur Google Maps
            </a>
          </div>
        )}

        {rating && rating <= 3 && (
          <div className="space-y-4">
            {sent ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Merci pour votre retour 🙏
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Votre message a bien été transmis.
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700">
                  Désolé que l’expérience n’ait pas été parfaite. Comment pouvons-nous nous améliorer ?
                </p>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dites-nous ce qui pourrait être amélioré..."
                  className="w-full h-28 p-3 rounded-xl border bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />

                <button
                  onClick={sendFeedback}
                  className="w-full bg-black text-white py-3 rounded-xl font-semibold"
                >
                  Envoyer mon retour
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}