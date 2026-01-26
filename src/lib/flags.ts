import { type Attributes, growthbookAdapter } from '@flags-sdk/growthbook'
import type { Identify } from 'flags'
import { dedupe, flag } from 'flags/next'

import { auth } from './auth/authjs'

// Add any user attributes you want to use for targeting or experimentation
const identify = dedupe((async () => {
  const session = await auth()

  return {
    id: session?.user?.id,
    // etc...
  }
}) satisfies Identify<Attributes>)

/**
 * Flag to disable the equipments section
 * @default true
 * @description If the flag is true, the equipments section will be disabled
 * @example
 * ```ts
 * const isDisableEquipments = await disableEquipmentsFlag()
 * if (isDisableEquipments) {
 *   return <div>Equipments section is disabled</div>
 * }
 * ```
 */
export const disableEquipmentsFlag = flag({
  key: 'disable_equipments',
  identify,
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: true,
})

/**
 * Flag to disable the boiler report section
 *
 * @default true
 * @description If the flag is true, the boiler report section will be disabled
 * @example
 * ```ts
 * const isDisableBoilerReport = await disableBoilerReportFlag()
 * if (isDisableBoilerReport) {
 *   return <div>Boiler report section is disabled</div>
 * }
 * ```
 */
export const disableBoilerReportFlag = flag({
  key: 'disable_boiler_report',
  identify,
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: true,
})
