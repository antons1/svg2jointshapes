const fs = require('fs');
const svgson = require('svgson');

function json2joint(fname, stArray) {
    
    let elementName = "coras." + fname.split(".")[0];
    elementName = elementName.replace(/\-|\_/gmi, "");
    const defaultStyle = {};
    
    return (json) => {
        const elems = json.childs;
        const jointObj = elems.map((elem, i) => ({ tagName: elem.name, selector: i.toString(), attributes: elem.attrs }));
        const prototype = { markup: jointObj };
        stArray.push(`joint.dia.Element.define("${elementName}", ${JSON.stringify(defaultStyle, null, 2)}, ${JSON.stringify(prototype).replace(/\n/gmi, " ")});`);
    }
}

const stArray = [];
const files = fs.readdirSync(process.argv[2]);
const svgs = files.filter((name) => /\.svg$/.test(name));
const contents = svgs.map((svg) => fs.readFileSync(svg, 'utf-8'));
contents.forEach((content, index) => svgson(content, { svgo: true }, json2joint(svgs[index], stArray)));

fs.writeFileSync("CORASShapes.js", "function AddCorasShapes(joint) {\n");
stArray.forEach((line) => fs.writeFileSync("CORASShapes.js", `${line}\n`, { flag: 'a' }));
fs.writeFileSync("CORASShapes.js", '\n', { flag: 'a' });
fs.writeFileSync("CORASShapes.js", "}\n\nexport default AddCorasShapes;\n", { flag: 'a' });

let x = 10;
const nameArr = [];
svgs.forEach((svg) => {
    let name = svg.split(".")[0];
    name = name.replace(/\-|\_/gmi, "");
    nameArr.push(name);
    console.log(`const ${name} = new joint.shapes.coras.${name}();\n${name}.position(${x}, 10);\n`);
    x += 60;    
});

console.log(`paper.addCell([${nameArr.toString()}]);`);