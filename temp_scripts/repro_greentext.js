
const content1 = ">text";
const content2 = "> text";

function test(content, preview) {
  let text = content;
  if (preview) {
    text = content.replace(/\n+/g, " ").trim();
  }
  
  const isGreentext = text.startsWith(">") && !text.startsWith(">>");
  console.log(`Content: "${content}", Preview: ${preview}, IsGreentext: ${isGreentext}, Text: "${text}"`);
}

console.log("--- Non-Preview Mode ---");
test(">text", false);
test("> text", false);

console.log("\n--- Preview Mode Specifics ---");
test(">text", true);
test("> text", true);
test(">  text", true);
test("\n>text", true);
test("\n> text", true);
