import {StoryblokStory} from 'storyblok-generate-ts'

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

export interface PageStoryblok {
  title?: string;
  body?: any[];
  _uid: string;
  component: "Page";
  [k: string]: any;
}

export interface ParagraphStoryblok {
  content?: string;
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
