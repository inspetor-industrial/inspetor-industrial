import { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

type BubbleFooterProps = ComponentProps<'div'> & {
  icon: IconType
  iconSize?: 'md' | 'sm'
  text: string
}

export function BubbleFooter({
  icon: Icon,
  text,
  className,
  iconSize = 'md',
  ...rest
}: BubbleFooterProps) {
  return (
    <div
      className={twMerge(
        'flex w-48 flex-col items-center h-full justify-center gap-4 overflow-hidden rounded-xl !bg-white p-4 text-center transition-all duration-300 shadow-lg hover:shadow-xl max-sm:w-full max-sm:flex-row max-sm:items-center max-sm:justify-start max-sm:gap-3 max-sm:text-left max-sm:p-3',
        className,
      )}
      {...rest}
    >
      <div className="flex-shrink-0 rounded-full border-2 border-inspetor-dark-blue-700">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-inspetor-dark-blue-700 max-sm:h-16 max-sm:w-16">
          <Icon
            size={iconSize === 'md' ? 50 : 40}
            style={{ color: 'white' }}
            className="max-sm:text-[32px]"
          />
        </div>
      </div>
      <div className="flex-1 max-sm:min-w-0">
        <p className="whitespace-normal text-base font-semibold leading-tight text-gray-800 max-sm:text-sm">
          {text}
        </p>
      </div>
    </div>
  )
}
