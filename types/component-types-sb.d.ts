import {StoryblokStory} from 'storyblok-generate-ts'

export interface ConfigStoryblok {
  navigation_menu?: (NavigationLinkStoryblok | NavigationDropdownStoryblok)[];
  _uid: string;
  component: "config";
  [k: string]: any;
}

export interface HeadingStoryblok {
  content?: string;
  _uid: string;
  component: "Heading";
  [k: string]: any;
}

export type MultiassetStoryblok = {
  alt?: string;
  copyright?: string;
  id: number;
  filename: string;
  name: string;
  title?: string;
  [k: string]: any;
}[];

export interface ImageGridStoryblok {
  images: MultiassetStoryblok;
  _uid: string;
  component: "ImageGrid";
  [k: string]: any;
}

export interface NavigationDropdownStoryblok {
  title: string;
  navigation_links?: NavigationLinkStoryblok[];
  _uid: string;
  component: "NavigationDropdown";
  [k: string]: any;
}

export type MultilinkStoryblok =
  | {
      cached_url?: string;
      linktype?: string;
      [k: string]: any;
    }
  | {
      id?: string;
      cached_url?: string;
      anchor?: string;
      linktype?: "story";
      story?: {
        name: string;
        created_at?: string;
        published_at?: string;
        id: number;
        uuid: string;
        content?: {
          [k: string]: any;
        };
        slug: string;
        full_slug: string;
        sort_by_date?: null | string;
        position?: number;
        tag_list?: string[];
        is_startpage?: boolean;
        parent_id?: null | number;
        meta_data?: null | {
          [k: string]: any;
        };
        group_id?: string;
        first_published_at?: string;
        release_id?: null | number;
        lang?: string;
        path?: null | string;
        alternates?: any[];
        default_full_slug?: null | string;
        translated_slugs?: null | any[];
        [k: string]: any;
      };
      [k: string]: any;
    }
  | {
      url?: string;
      cached_url?: string;
      anchor?: string;
      linktype?: "asset" | "url";
      [k: string]: any;
    }
  | {
      email?: string;
      linktype?: "email";
      [k: string]: any;
    };

export interface NavigationLinkStoryblok {
  title: string;
  link?: MultilinkStoryblok;
  _uid: string;
  component: "NavigationLink";
  [k: string]: any;
}

export interface PageStoryblok {
  title?: string;
  body?: any[];
  _uid: string;
  component: "Page";
  [k: string]: any;
}

export interface RichtextStoryblok {
  type: string;
  content?: RichtextStoryblok[];
  marks?: RichtextStoryblok[];
  attrs?: any;
  text?: string;
  [k: string]: any;
}

export interface ParagraphStoryblok {
  content?: RichtextStoryblok;
  _uid: string;
  component: "Paragraph";
  [k: string]: any;
}

export interface ScripProviderStoryblok {
  name: string;
  code: string;
  type: "" | "school" | "church";
  _uid: string;
  component: "scrip-provider";
  [k: string]: any;
}

export interface VirtualTourStoryblok {
  url: string;
  _uid: string;
  component: "VirtualTour";
  [k: string]: any;
}
