import { useState } from 'react'
import { Button } from '@/components/ui/button' // Ensure this import path matches your project structure
import { Download, Share2, BookOpen } from 'lucide-react'
import GitHubButton from 'react-github-btn'

const StoryAndShare = () => {
  const originalShareButtonText = 'Share this tool'
  const [shareButtonText, setShareButtonText] = useState(
    originalShareButtonText
  )

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PDF Page Extractor',
          text: 'Check out this useful tool to extract pages from your PDFs!',
          url: window.location.href,
        })
        console.log('Page shared successfully!')
      } catch (error) {
        console.error('Error sharing:', error)
        try {
          // fallback to copying the URL if sharing fails, no need to alert the user
          navigator.clipboard.writeText(window.location.href)
          setShareButtonText('URL copied!')
          setTimeout(() => {
            setShareButtonText(originalShareButtonText)
          }, 2000)
        } catch (error) {
          console.error('Error copying URL:', error)
          setShareButtonText('Error!')
          setTimeout(() => {
            setShareButtonText(originalShareButtonText)
          }, 2000)
        }
      }
    } else {
      alert('Sharing not supported. Copy the URL directly.')
    }
  }

  return (
    <div className="story-and-share shadow-md rounded-lg">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <BookOpen />
        The story behind this tool
      </h3>
      <p className="text-sm mb-2">
        This tool was born from the need to extract my favorite songs from a
        very long songbook filled with chords for guitar 🎸. Use this tool to
        create a PDF of your favorite pages from any lengthy PDF
      </p>
      <div className="flex items-center space-x-4 my-4">
        <Button
          onClick={() => {
            window.open('/songs.pdf', '_blank')
          }}
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Download className="mr-2" />
          Download the songbook
        </Button>
        <Button onClick={handleShare} className="flex items-center">
          <Share2 className="mr-2" />
          {shareButtonText}
        </Button>
      </div>
      <div>
        <GitHubButton
          href="https://github.com/ncamaa/pdf-page-extractor"
          data-color-scheme="no-preference: dark; light: light; dark: dark;"
          data-icon="octicon-star"
          data-size="large"
          aria-label="Star ncamaa/pdf-page-extractor on GitHub"
        >
          Star
        </GitHubButton>
      </div>
    </div>
  )
}

export default StoryAndShare
