export interface Category {
    slug: string;
    title: string;
    description: string;
    [key: string]: string | undefined;
}

export interface Guideline {
    summary: string;
    points: string[];
}
