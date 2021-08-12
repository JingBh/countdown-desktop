type IDate = [number, number, number]

export interface ITimerConfig {
  /**
   * This will be formatted before display.
   *
   * Format keys:
   * `{days}`: Days to dest.
   *
   * Supports HTML for advanced CSS customization.
   *
   * Only specifying a string equals to specifying `text.before`.
   */
  text: string | {
    before: string,

    /**
     * Doesn't support `{days}` formatting.
     */
    on?: string,

    /**
     * `{days}` will be days from dest.
     */
    after?: string
  },

  /**
   * This is the day you want to count to.
   *
   * Currently supports dates only.
   *
   * If not specified, `{days}` formatting will be unavailable
   * and only `text.before` will be displayed.
   */
  dest?: IDate,

  /**
   * This piece of CSS will be applied **globally**
   * when the timer is active.
   */
  css?: string
}

export interface IConfig {
  /**
   * All timers.
   *
   * The first timer in this list will be
   * displayed first when the app starts.
   */
  timers: ITimerConfig[],

  /**
   * Switch to the next timer after these many seconds.
   *
   * Must be a positive number.
   */
  switchDuration: number
}

export const getDefaultConfig = (): IConfig => ({
  timers: [],
  switchDuration: 60
})
