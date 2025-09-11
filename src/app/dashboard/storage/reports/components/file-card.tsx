'use client'

import { Badge } from '@inspetor/components/ui/badge'
import { Button } from '@inspetor/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@inspetor/components/ui/card'
import { dayjsApi } from '@inspetor/lib/dayjs'
import { cn } from '@inspetor/lib/utils'
import type { GoogleDriveFile } from '@inspetor/types/google'
import { formatFileSize } from '@inspetor/utils/format-file-size'
import {
  Archive,
  Calendar,
  Download,
  FileText,
  Folder,
  Image,
  Music,
  User,
  Video,
} from 'lucide-react'

type FileCardProps = {
  file: GoogleDriveFile
  onDownload?: (file: GoogleDriveFile) => Promise<void>
  onOpenFolder?: (file: GoogleDriveFile) => void
  isDownloading?: boolean
}

export function FileCard({
  file,
  onDownload,
  onOpenFolder,
  isDownloading,
}: FileCardProps) {
  const modifiedAtFormatted = dayjsApi(file.modifiedTime).fromNow()
  const fileSize = formatFileSize(parseInt(file.size || '0'))

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('audio/')) return Music
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return FileText
    if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('tar')
    )
      return Archive
    return Folder
  }

  function getFileExtension(file: GoogleDriveFile) {
    if (file.mimeType.toLowerCase() === 'application/vnd.google-apps.folder') {
      return 'pasta'.toUpperCase()
    }

    return file.mimeType.toLocaleLowerCase() ===
      'application/vnd.google-apps.shortcut' ||
      file.mimeType.toLocaleLowerCase() === 'application/vnd.google-apps.folder'
      ? 'PASTA'
      : 'ARQUIVO'
  }

  const FileIcon = getFileIcon(file.mimeType)
  const isFile = ![
    'application/vnd.google-apps.folder',
    'application/vnd.google-apps.shortcut',
  ].includes(file.mimeType.toLowerCase())

  return (
    <Card className="group relative w-full p-0 h-80 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-border/50 hover:border-border">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Thumbnail Section */}
        <div className="relative border-b border-border/50 h-48 bg-gradient-to-br from-muted/20 to-muted/10 rounded-t-lg overflow-hidden">
          {file.hasThumbnail && file.thumbnailLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.thumbnailLink}
              alt={file.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {file.iconLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.iconLink}
                  alt={file.name}
                  className="w-16 h-16 text-muted-foreground/50"
                />
              ) : (
                <FileIcon className="w-16 h-16 text-muted-foreground/50" />
              )}
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              {isFile && (
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-foreground"
                  onClick={() => onDownload?.(file)}
                >
                  <Download className="size-4" />
                </Button>
              )}

              {/* <Button
                size="icon"
                variant="outline"
                className="bg-white/90 hover:bg-white text-foreground"
                onClick={() => onShare?.(file)}
              >
                <Share2 className="size-4" />
              </Button> */}
              {/* <Button
                size="icon"
                variant="outline"
                className="bg-white/90 hover:bg-white text-foreground"
                onClick={() => onMore?.(file)}
              >
                <MoreVertical className="size-4" />
              </Button> */}
            </div>
          </div>

          {/* File type badge */}
          <Badge
            variant="secondary"
            className={cn(
              'absolute top-2 left-2 text-xs font-medium uppercase',
              file.mimeType.startsWith('image/') &&
                'bg-blue-50 text-blue-700 border-blue-200',
              file.mimeType.startsWith('video/') &&
                'bg-purple-50 text-purple-700 border-purple-200',
              file.mimeType.startsWith('audio/') &&
                'bg-green-50 text-green-700 border-green-200',
              (file.mimeType.includes('pdf') ||
                file.mimeType.includes('document')) &&
                'bg-red-50 text-red-700 border-red-200',
              (file.mimeType.includes('zip') ||
                file.mimeType.includes('rar') ||
                file.mimeType.includes('tar')) &&
                'bg-orange-50 text-orange-700 border-orange-200',
            )}
          >
            {getFileExtension(file)}
          </Badge>

          {/* Shared indicator */}
          {file.shared && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Compartilhado
            </Badge>
          )}
        </div>

        {/* File Info Section */}
        <div className="flex-1 p-4 flex flex-col">
          <CardHeader className="p-0 gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
              {file.name}
            </CardTitle>
          </CardHeader>

          <div className="flex-1 space-y-2 mt-3">
            {/* File size and type */}
            {isFile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileIcon className="size-3" />
                <p className="truncate shrink-0">{fileSize}</p>
                <p className="-mx-0.5">•</p>
                <p className="truncate">
                  {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                </p>
              </div>
            )}

            {/* Modified time */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Modificado {modifiedAtFormatted}</span>
            </div>

            {/* Owner info */}
            {file.owners?.[0] && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{file.owners[0].displayName}</span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
            {!isFile && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => onOpenFolder?.(file)}
              >
                Abrir
              </Button>
            )}
            {isFile && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onDownload?.(file)}
                isLoading={isDownloading}
              >
                Baixar
                {/* <Download className="w-3 h-3" /> */}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
