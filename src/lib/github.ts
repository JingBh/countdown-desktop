import { Octokit } from '@octokit/rest'
import yaml from 'js-yaml'

import { IConfig, getDefaultConfig } from '@/lib/config'

export async function getConfig (gistId: string): Promise<IConfig> {
  const octokit = new Octokit()
  const data = (await octokit.gists.get({ gist_id: gistId })).data || {}
  const files = data.files || {}
  const { content } = files['config.yml'] || {}
  const config = yaml.load(content || '') as Partial<IConfig>
  const defaultConfig = getDefaultConfig()
  if (!config.timers) config.timers = defaultConfig.timers
  if (!config.switchDuration) config.switchDuration = defaultConfig.switchDuration
  return config as IConfig
}
