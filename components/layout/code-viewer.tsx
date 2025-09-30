'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Copy, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface CodeFile {
  name: string
  content: string
  language: string
}

interface CodeViewerProps {
  chatId: string
  selectedGenerationIndex: number
}

export function CodeViewer({ chatId, selectedGenerationIndex }: CodeViewerProps) {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([])
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  useEffect(() => {
    fetchCodeFiles()
  }, [chatId])

  const fetchCodeFiles = async () => {
    if (!chatId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/code/${chatId}`)
      if (response.ok) {
        const files = await response.json()
        setCodeFiles(files)
        if (files.length > 0) {
          setSelectedFile(files[0])
        }
      }
    } catch (error) {
      console.error('Error fetching code files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(fileName)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'vue': 'vue',
      'svelte': 'svelte'
    }
    return languageMap[extension || ''] || 'text'
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading code files...</p>
        </div>
      </div>
    )
  }

  if (codeFiles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No code files available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* File List Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Files</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {codeFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFile?.name === file.name
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Code Content */}
      <div className="flex-1 flex flex-col">
        {selectedFile && (
          <>
            {/* File Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900">{selectedFile.name}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedFile.content, selectedFile.name)}
                    className="text-gray-600"
                  >
                    {copiedFile === selectedFile.name ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copiedFile === selectedFile.name ? 'Copied!' : 'Copy to clipboard'}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Code Display */}
            <ScrollArea className="flex-1">
              <SyntaxHighlighter
                language={getLanguageFromFileName(selectedFile.name)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
                showLineNumbers
                wrapLines
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}


