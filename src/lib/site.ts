import { parse } from 'yaml';
import siteYaml from '../data/site.yml?raw';

export interface Site {
  name: string;
  fullname: string;
  url: string;
  email: string;
  description: string;
  keywords: string[];
  copyright: string;
  license: string;
  license_link: string;
  repository: string;
  twitter: string;
  twitter_username: string;
  twitter_card: string;
  google_analytics: string;
  google_site_verification: string;
  default_share_image: string;
}

export const SITE = parse(siteYaml) as Site;
