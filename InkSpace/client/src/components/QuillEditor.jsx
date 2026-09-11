import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const toolbar = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean']
]

export default function QuillEditor({ value, onChange }) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)
  const changeRef = useRef(onChange)
  changeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    const editor = document.createElement('div')
    hostRef.current.appendChild(editor)
    const quill = new Quill(editor, {
      theme: 'snow',
      placeholder: 'Tell a story worth reading…',
      modules: { toolbar, history: { delay: 1000, maxStack: 100, userOnly: true } }
    })
    quill.clipboard.dangerouslyPasteHTML(value || '')
    quill.on('text-change', () => changeRef.current(quill.root.innerHTML))
    quillRef.current = quill
    return () => { quillRef.current = null; hostRef.current.innerHTML = '' }
  }, [])

  return <div className="editor-shell" ref={hostRef} />
}
