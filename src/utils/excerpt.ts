import MarkdownIt from "markdown-it";
import { convert, type HtmlToTextOptions } from "html-to-text";
const parser = new MarkdownIt();

export const createExcerpt = (body: string): string => {
  const html = parser.render(body);
  const options: HtmlToTextOptions = {
    wordwrap: null,
    limits: {
      maxBaseElements: 1,
    },
    baseElement: "p",
  };

  const text = convert(html, options);
  const distilled = convert(text, options);

  return distilled;
};
