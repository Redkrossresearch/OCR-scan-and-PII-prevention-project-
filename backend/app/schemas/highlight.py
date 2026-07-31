from pydantic import BaseModel


class Highlight(BaseModel):
    type: str
    value: str


class HighlightResponse(BaseModel):
    text: str
    highlights: list[Highlight] 