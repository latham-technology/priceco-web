import type { Schema, Attribute } from '@strapi/strapi'

export interface BlocksImageHero extends Schema.Component {
    collectionName: 'components_blocks_image_heroes'
    info: {
        displayName: 'imageHero'
        icon: 'picture'
    }
    attributes: {
        image: Attribute.Component<'blocks.image', true>
    }
}

export interface BlocksImage extends Schema.Component {
    collectionName: 'components_blocks_images'
    info: {
        displayName: 'image'
        icon: 'picture'
    }
    attributes: {
        image: Attribute.Media & Attribute.Required
        alt: Attribute.String
    }
}

export interface BlocksMoreInfoLinks extends Schema.Component {
    collectionName: 'components_blocks_more_info_links'
    info: {
        displayName: 'MoreInfoLinks'
        icon: 'link'
        description: ''
    }
    attributes: {
        content: Attribute.String
        URL: Attribute.String
        newWindow: Attribute.Boolean & Attribute.DefaultTo<true>
        page: Attribute.Relation<
            'blocks.more-info-links',
            'oneToOne',
            'api::page.page'
        >
    }
}

export interface BlocksRichText extends Schema.Component {
    collectionName: 'components_blocks_rich_texts'
    info: {
        displayName: 'richText'
        icon: 'quote'
        description: ''
    }
    attributes: {
        content: Attribute.RichText
    }
}

export interface BlocksTitle extends Schema.Component {
    collectionName: 'components_blocks_titles'
    info: {
        displayName: 'title'
    }
    attributes: {
        content: Attribute.String & Attribute.Required
    }
}

export interface SeoMeta extends Schema.Component {
    collectionName: 'components_seo_metas'
    info: {
        displayName: 'meta'
        icon: 'information'
        description: ''
    }
    attributes: {
        name: Attribute.String
        content: Attribute.String
    }
}

export interface SeoSeo extends Schema.Component {
    collectionName: 'components_seo_seos'
    info: {
        displayName: 'seo'
        icon: 'information'
        description: ''
    }
    attributes: {
        title: Attribute.String & Attribute.Required
        description: Attribute.String
        meta: Attribute.Component<'seo.meta', true>
    }
}

declare module '@strapi/types' {
    export module Shared {
        export interface Components {
            'blocks.image-hero': BlocksImageHero
            'blocks.image': BlocksImage
            'blocks.more-info-links': BlocksMoreInfoLinks
            'blocks.rich-text': BlocksRichText
            'blocks.title': BlocksTitle
            'seo.meta': SeoMeta
            'seo.seo': SeoSeo
        }
    }
}
