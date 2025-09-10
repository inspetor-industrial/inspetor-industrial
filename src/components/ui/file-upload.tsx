import { cn } from '@inspetor/lib/utils'
import { IconUpload, IconX } from '@tabler/icons-react'
import { motion } from 'motion/react'
import React, {
  type RefObject,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useDropzone } from 'react-dropzone'

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
}

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
}

type FileUploadProps = {
  files?: File[]
  onChange?: (files: File[]) => void
  ref?: RefObject<any>
  accept?: string
}

export const FileUpload = ({
  onChange,
  files: initialFiles = [],
  ref,
  accept = 'image/*',
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (newFiles: File[]) => {
    // Filtrar arquivos baseado no accept
    const validFiles =
      accept === 'image/*'
        ? newFiles.filter((file) => file.type.startsWith('image/'))
        : newFiles
    setFiles((prevFiles) => [...prevFiles, ...validFiles])
    onChange?.(validFiles)
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove)
      onChange?.(newFiles)
      return newFiles
    })
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept:
      accept === 'image/*'
        ? {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
          }
        : undefined,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error)
    },
  })

  useImperativeHandle(ref, () => ({
    getFiles: () => files,
    setFiles: (newFiles: File[]) => setFiles(newFiles),
    clearFiles: () => setFiles([]),
  }))

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload de Imagem
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Arraste e solte uma imagem aqui ou clique para selecionar
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={'file' + idx}
                  layoutId={'file-upload-' + idx}
                  className={cn(
                    'relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md',
                    'shadow-sm',
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <div className="flex items-center gap-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-white shadow-input"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(idx)
                        }}
                        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        type="button"
                      >
                        <IconX className="h-4 w-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex text-sm gap-4 md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="truncate px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="truncate"
                    >
                      modified{' '}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}

            {/* Ícone de upload sempre visível */}
            {files.length === 0 && (
              <motion.div
                layoutId="file-upload-icon"
                variants={mainVariant}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  'relative z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md',
                  'shadow-[0px_10px_50px_rgba(0,0,0,0.1)] group-hover/file:shadow-2xl',
                  '!opacity-100',
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {/* Overlay para hover quando não há arquivos */}
            {files.length === 0 && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md group-hover/file:opacity-100 transition-opacity"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function GridPattern() {
  const columns = 41
  const rows = 11
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? 'bg-gray-50 dark:bg-neutral-950'
                  : 'bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]'
              }`}
            />
          )
        }),
      )}
    </div>
  )
}
