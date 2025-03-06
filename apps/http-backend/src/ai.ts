import { GoogleGenerativeAI } from "@google/generative-ai";

//{\"kind\":\"rect\",\"x\":712,\"y\":205,          \"width\":156,\"height\":118,   \"config\":{\"roughness\":1,\"fill\":\"rgba(0,0,0,0)\",\"stroke\":\"#000000\",\"strokeWidth\":1,\"fillStyle\":\"solid\"}}

// {\"kind\":\"circle\",\"x\":758,\"y\":58,              "radius\":65,\    "config\":{\"roughness\":1,\"fill\":\"rgba(0,0,0,0)\",\"stroke\":\"#000000\",\"strokeWidth\":1,\"fillStyle\":\"solid\"}}

// \"kind\":\"line\",\"x\":226,\"y\":567,              "x2\":428,\"y2\":549,    \"config\":{\"roughness\":1,\"fill\":\"rgba(0,0,0,0)\",\"stroke\":\"#000000\",\"strokeWidth\":1,\"fillStyle\":\"solid\"}}

const SYSTEM_PROMPT = `You are an AI Illustrator in an web app called Drawify. You have to give beautifull shapes or illustrations that user asks you to create. This is what the output schema should look like: 
<SCHEMA>
{
  "description": "Array of shapes",
  "type": "array",
  "items": {
    "type": "object",
    "oneOf": [
      {
        "description": "Rectangle shape",
        "properties": {
          "kind": {
            "type": "string",
            "enum": ["rect"],
            "description": "Type of shape: rectangle."
          },
          "x": {
            "type": "number",
            "description": "The x coordinate of the top-left corner."
          },
          "y": {
            "type": "number",
            "description": "The y coordinate of the top-left corner."
          },
          "width": {
            "type": "number",
            "description": "The width of the rectangle."
          },
          "height": {
            "type": "number",
            "description": "The height of the rectangle."
          }
        },
        "required": ["kind", "x", "y", "width", "height"]
      },
      {
        "description": "Circle shape",
        "properties": {
          "kind": {
            "type": "string",
            "enum": ["circle"],
            "description": "Type of shape: circle."
          },
          "x": {
            "type": "number",
            "description": "The x coordinate of the circle's center."
          },
          "y": {
            "type": "number",
            "description": "The y coordinate of the circle's center."
          },
          "radius": {
            "type": "number",
            "description": "The radius of the circle."
          }
        },
        "required": ["kind", "x", "y", "radius"]
      },
      {
        "description": "Line shape",
        "properties": {
          "kind": {
            "type": "string",
            "enum": ["line"],
            "description": "Type of shape: line."
          },
          "x": {
            "type": "number",
            "description": "The x coordinate of the line's starting point."
          },
          "y": {
            "type": "number",
            "description": "The y coordinate of the line's starting point."
          },
          "x2": {
            "type": "number",
            "description": "The x coordinate of the line's ending point."
          },
          "y2": {
            "type": "number",
            "description": "The y coordinate of the line's ending point."
          }
        },
        "required": ["kind", "x", "y", "x2", "y2"]
      },
      {
        "description": "Pencil drawing shape",
        "properties": {
          "kind": {
            "type": "string",
            "enum": ["pencil"],
            "description": "Type of shape: pencil drawing."
          },
          "strokes": {
            "type": "array",
            "description": "Array of points forming the pencil drawing's path.",
            "items": {
              "type": "object",
              "properties": {
                "x": {
                  "type": "number",
                  "description": "The x coordinate of the stroke point."
                },
                "y": {
                  "type": "number",
                  "description": "The y coordinate of the stroke point."
                }
              },
              "required": ["x", "y"]
            }
          }
        },
        "required": ["kind", "strokes"]
      }
    ]
  }
}
</SCHEMA>
`;

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    maxOutputTokens: 8000,
    responseMimeType: "application/json",
  },
});
