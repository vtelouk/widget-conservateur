export default class InfoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.jsonData = this.getContractInfo();
    this.render();
  }

  // ========== Your existing getters ==========
  getContractInfo() {
    let info = this.cad;
    for (const iterator of info) {
      try {
        const contratInfo = iterator[1].interaction.callAssociatedData.CONTRACT_INFO.value;
        if (typeof contratInfo === "string") {
          const unescaped2 = contratInfo.replace(/\\\\\\"/g, '"').replace(/\\\\/g, '\\');
          const parsed = JSON.parse(unescaped2);
          return parsed;
        }
        return contratInfo;
      } catch (error) {
        console.error("Error extracting contract info:", error);
        return { error: "Invalid or missing CONTRAT_INFO" };
      }
    }
  }

  GETNAME() {
    let info = this.cad;
    for (const iterator of info) {
      try {
        return iterator[1].interaction.callAssociatedData.NAME.value;
      } catch (error) {
        return "error";
      }
    }
  }

  GetLastName() {
    let info = this.cad;
    for (const iterator of info) {
      try {
        return iterator[1].interaction.callAssociatedData.LAST_NAME.value;
      } catch (error) {
        return "error";
      }
    }
  }

  GetNameUsage() {
    let info = this.cad;
    for (const iterator of info) {
      try {
        return iterator[1].interaction.callAssociatedData.LAST_NAME_USAGE.value;
      } catch (error) {
        return "error";
      }
    }
  }

  GetEmail() {
    let info = this.cad;
    for (const iterator of info) {
      try {
        return iterator[1].interaction.callAssociatedData.EMAIL_USER.value;
      } catch (error) {
        return "error";
      }
    }
  }

  mediaInfo() {
    const info = this.cad;
    for (const iterator of info) {
      const media = iterator[1].interaction.media;
      const response = Object.keys(media).map((infok) => media[infok]);
      return response;
    }
  }

  activeParticipants() {
    const info = this.cad;
    for (const iterator of info) {
      const media = iterator[1].interaction.media;
      const response = Object.keys(media).map((infok) => {
        const { participants } = media[infok];
        return participants;
      });
      return response;
    }
  }

  // ========== Tree view methods ==========
  createTreeNode(key, value, isExpanded = true) {
    const nodeEl = document.createElement("div");
    nodeEl.classList.add("tree-node");

    const labelEl = document.createElement("span");
    labelEl.classList.add("label");

    const toggleEl = document.createElement("span");
    toggleEl.classList.add("toggle");

    const isObject = value !== null && typeof value === "object";

    if (isObject) {
      toggleEl.textContent = "+";
      nodeEl.appendChild(toggleEl);

      labelEl.textContent = key;
      nodeEl.appendChild(labelEl);

      const childrenEl = document.createElement("div");
      childrenEl.classList.add("children");

      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          const child = this.createTreeNode(`${key}[${idx}]`, item, isExpanded);
          childrenEl.appendChild(child);
        });
      } else {
        for (const childKey in value) {
          const child = this.createTreeNode(childKey, value[childKey], isExpanded);
          childrenEl.appendChild(child);
        }
      }

      nodeEl.appendChild(childrenEl);

      labelEl.addEventListener("click", () => {
        const expanded = nodeEl.classList.toggle("expanded");
        toggleEl.textContent = expanded ? "-" : "+";
      });

      if (isExpanded) {
        nodeEl.classList.add("expanded");
        toggleEl.textContent = "-";
      }
    } else {
      toggleEl.textContent = " ";
      nodeEl.appendChild(toggleEl);
      labelEl.textContent = `${key}: ${value}`;
      nodeEl.appendChild(labelEl);
    }

    return nodeEl;
  }

  buildTree(container, json, isExpanded = true) {
    for (const key in json) {
      const node = this.createTreeNode(key, json[key], isExpanded);
      container.appendChild(node);
    }
  }

  // ========== Render method ==========
  render() {
    const template = document.createElement("template");
    template.innerHTML = `
  <style>
    :host {
      --primary: #007AA3;
      --primary-hover: #005E7D;
      --card-bg: rgba(255, 255, 255, 0.8);
      --card-border: rgba(255, 255, 255, 0.3);
      --text-color: #1a1a1a;
      --shadow: 0 4px 12px rgba(0,0,0,0.1);
      --radius: 16px;
      font-family: "Inter", system-ui, sans-serif;
      color: var(--text-color);
    }

    .container {
      overflow: var(--flow, auto);
      background: linear-gradient(135deg, #E0F7FA, #F3F4F6);
      min-height: 100vh;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 1400px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(12px);
      border-radius: var(--radius);
      padding: 1.2rem;
      box-shadow: var(--shadow);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    img {
      margin-top: 15px;
      border-radius: 12px;
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }

    .hide {
      display: none;
    }

    .btn, .btns, .btnpost {
      border: none;
      height: 40px;
      padding: 0 20px;
      border-radius: 24px;
      background: var(--primary);
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.4px;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
      box-shadow: 0 3px 6px rgba(0,0,0,0.15);
      margin-top: 10px;
    }

    .btn:hover, .btns:hover, .btnpost:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }

    pre {
      background: #f3f3f3;
      padding: 0.8rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.9rem;
      margin-top: 1rem;
    }

  </style>

  <div class="container">
    <div class="cards">
      
      <div class="card">
        <h3 class="italic">Informations Utilisateur</h3>
        <p><strong>Prénom:</strong> ${this.GETNAME()}</p>
        <p><strong>Nom:</strong> ${this.GetLastName()}</p>
        <p><strong>Nom d’usage:</strong> ${this.GetNameUsage()}</p>
        <p><strong>Email:</strong> ${this.GetEmail()}</p>
      </div>

      <div id="treeContainer" class="card">
        <h3 class="italic">Structure</h3>
      </div>

      <div class="card">
        <h3 class="italic">Détails</h3>
        <button class="btn">Afficher les détails</button>
        <pre class="hide">${JSON.stringify(this.details, null, 2)}</pre>
      </div>

      <div class="card">
        <h3 class="italic">Bouton météo</h3>
        <button class="btns">Afficher la météo</button>
        <pre class="hide"></pre>
      </div>

      <div class="card">
        <h3 class="italic">Test POST API publique</h3>
        <button class="btnpost">Tester un POST</button>
        <pre id="postResult">Résultat du POST ici...</pre>
      </div>

      <div class="card">
        <h3 class="italic">Test POST avec Authentification (CRM Conservateur)</h3>
        <button class="btncrm">Envoyer vers CRM</button>
        <pre id="crmResult">Résultat du CRM ici...</pre>
      </div>
    </div>
  </div>
`;

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // === Build the JSON tree ===
    const treeContainer = this.shadowRoot.querySelector("#treeContainer");
    if (treeContainer) this.buildTree(treeContainer, this.jsonData, true);

    // === Toggle hide/show for details ===
    const cards = this.shadowRoot.querySelectorAll("div.card");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const target = card.querySelector("p.hide, h3.hide, img.hide");
        if (target) target.classList.toggle("hide");
      });
    });

    // === Bouton météo ===
    const crmButton = this.shadowRoot.querySelector(".btns");
    if (crmButton) {
      crmButton.addEventListener("click", async () => {
        try {
          const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true"
          );
          if (!response.ok) throw new Error("Erreur API météo");

          const data = await response.json();
          const temperature = data.current_weather.temperature;
          const windspeed = data.current_weather.windspeed;

          console.log("🌤️ Température à Paris :", temperature, "°C");
          alert(`🌤️ Température à Paris : ${temperature}°C\nVent : ${windspeed} km/h`);

          const pre = this.shadowRoot.querySelector(".btns + pre");
          if (pre) {
            pre.textContent = JSON.stringify(data, null, 2);
            pre.classList.remove("hide");
          }
        } catch (err) {
          console.error("❌ Erreur API météo :", err);
          alert("Erreur lors de la récupération météo.");
        }
      });
    }

    const crmBtn = this.shadowRoot.querySelector(".btncrm");
    crmBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:5000/api/token", {
          method: "POST",
        });
        const data = await res.text();
        console.log("🔑 Réponse token :", data);
        alert("Résultat token : " + data);
      } catch (err) {
        console.error("❌ Erreur :", err);
        alert("Erreur token !");
      }
    });

    // === Bouton POST test ===
    const postBtn = this.shadowRoot.querySelector(".btnpost");
    const postResult = this.shadowRoot.querySelector("#postResult");
    postBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test POST depuis Webex",
            body: `Utilisateur : ${this.GETNAME()} ${this.GetLastName()}`,
            userId: 42,
          }),
        });

        if (!response.ok) throw new Error("Erreur POST " + response.status);
        const result = await response.json();
        console.log("✅ Réponse POST :", result);
        postResult.textContent = JSON.stringify(result, null, 2);
        alert("✅ POST réussi !");
      } catch (err) {
        console.error("❌ Erreur POST :", err);
        postResult.textContent = "Erreur : " + err.message;
      }
    });
  }


  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === "name") {
      this.shadowRoot.querySelectorAll("h3").forEach((e) => (e.innerText = newVal));
    } else if (attrName === "avatar") {
      this.shadowRoot.querySelectorAll("img").forEach((e) => (e.src = newVal));
    } else if (attrName === "darkmode") {
      const dark = newVal === "true";
      this.shadowRoot.querySelectorAll(".card").forEach((card) => {
        card.style.background = dark ? "#000" : "#fff";
        card.style.color = dark ? "#fff" : "#000";
      });
    }

  }

  static get observedAttributes() {
    return ["name", "darkmode", "avatar"];
  }
}

window.customElements.define("info-card", InfoCard);
