export interface Category {
    slug: string;
    title: string;
    description: string;
    [key: string]: string | undefined;
}
