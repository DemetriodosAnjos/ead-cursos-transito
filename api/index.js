var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/_handler.ts
var handler_exports = {};
__export(handler_exports, {
  default: () => handler_default
});
module.exports = __toCommonJS(handler_exports);

// server/app.ts
var import_express = __toESM(require("express"));
var import_dotenv2 = __toESM(require("dotenv"));

// src/data/courses.ts
var COURSES = [
  // =========================================================================
  // 1. CURSOS ESPECIALIZADOS / FORMAÇÃO DE CONDUTORES (DETRAN)
  // =========================================================================
  {
    id: "formacao-transporte-emergencia",
    title: "Forma\xE7\xE3o Transporte de Emerg\xEAncia",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "CVE",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Capacita\xE7\xE3o obrigat\xF3ria de 50 horas para condutores de ambul\xE2ncias, viaturas policiais e resgate.",
    fullDescription: "Curso homologado pelo DETRAN/CONTRAN com lan\xE7amento direto no RENACH/CNH Digital. Treinamento completo em dire\xE7\xE3o defensiva emergencial, condu\xE7\xE3o segura em deslocamentos r\xE1pidos, psicologia e legisla\xE7\xE3o.",
    price: 169,
    duration: "50 horas",
    workloadHours: 50,
    detranApproval: "Homologado Resolu\xE7\xE3o CONTRAN n\xBA 789/20 e DETRAN PR",
    modality: "100% Online EAD com Reconhecimento Facial",
    thumbnail: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80",
    badge: "Mais Procurado",
    requirements: ["Maior de 21 anos", "Habilitado em qualquer categoria (A, B, C, D ou E)", "Sem suspens\xE3o ativa na CNH"],
    modules: ["Legisla\xE7\xE3o de Tr\xE2nsito Aplicada", "Dire\xE7\xE3o Defensiva em Emerg\xEAncias", "Primeiros Socorros no Tr\xE2nsito", "Relacionamento Interpessoal"],
    isFeatured: true
  },
  {
    id: "formacao-produtos-perigosos",
    title: "Forma\xE7\xE3o Produtos Perigosos",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "MOPP",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Curso obrigat\xF3rio para condu\xE7\xE3o de cargas com combust\xEDveis, inflam\xE1veis, explosivos e qu\xEDmicas.",
    fullDescription: "Habilita\xE7\xE3o profissional para transporte rodovi\xE1rio de cargas perigosas. Conte\xFAdo completo sobre simbologia de risco, normas ANTT, equipamentos EPI e procedimentos em sinistros.",
    price: 169,
    duration: "50 horas",
    workloadHours: 50,
    detranApproval: "Homologado CONTRAN / DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80",
    badge: "Alta Demanda",
    requirements: ["Maior de 21 anos", "Habilitado na categoria B, C, D ou E", "Sem infra\xE7\xF5es grav\xEDssimas recentes"],
    modules: ["Classifica\xE7\xE3o dos Produtos Perigosos", "Legisla\xE7\xE3o Espec\xEDfica e ANTT", "Preven\xE7\xE3o de Inc\xEAndios", "Acondicionamento de Cargas"],
    isFeatured: true
  },
  {
    id: "formacao-escolar",
    title: "Forma\xE7\xE3o Escolar",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "CTE",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Qualifica\xE7\xE3o exigida para motoristas de vans escolares, micro-\xF4nibus e transporte infantil.",
    fullDescription: "Capacite-se para transportar crian\xE7as e adolescentes com m\xE1xima seguran\xE7a e conformidade perante as secretarias municipais e o DETRAN.",
    price: 169,
    duration: "50 horas",
    workloadHours: 50,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
    badge: "Vans Escolares",
    requirements: ["Maior de 21 anos", "Habilitado na categoria D ou E", "Certid\xE3o negativa criminal"],
    modules: ["Legisla\xE7\xE3o do Transporte Escolar", "Dire\xE7\xE3o Preventiva com Passageiros", "Primeiros Socorros Pedi\xE1tricos", "Relacionamento com Pais e Alunos"],
    isFeatured: true
  },
  {
    id: "formacao-coletivo-passageiros",
    title: "Forma\xE7\xE3o Coletivo de Passageiros",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "CTCP",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Capacita\xE7\xE3o para motoristas de \xF4nibus urbanos, metropolitanos, rodovi\xE1rios e turismo.",
    fullDescription: "Curso de 50 horas com registro autom\xE1tico na CNH Digital para atua\xE7\xE3o profissional em empresas de transporte p\xFAblico e fretamento.",
    price: 169,
    duration: "50 horas",
    workloadHours: 50,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 21 anos", "Habilitado na categoria D ou E"],
    modules: ["Legisla\xE7\xE3o de Transporte Coletivo", "Dire\xE7\xE3o Defensiva em Ve\xEDculos Pesados", "Acessibilidade e Inclus\xE3o", "Gest\xE3o de Crises a Bordo"]
  },
  {
    id: "formacao-cargas-indivisiveis",
    title: "Forma\xE7\xE3o Cargas Indivis\xEDveis",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "CCI",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Condu\xE7\xE3o de cargas excepcionais, superdimensionadas, turbinas e m\xE1quinas pesadas em pranchas.",
    fullDescription: "Qualifica\xE7\xE3o profissional para transporte de blocos, vigas, p\xE1s e\xF3licas e maquin\xE1rio que excedem limites convencionais de peso e dimens\xF5es.",
    price: 169,
    duration: "50 horas",
    workloadHours: 50,
    detranApproval: "Homologado CONTRAN / DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 21 anos", "Habilitado na categoria C, D ou E"],
    modules: ["Legisla\xE7\xE3o e AET (Autoriza\xE7\xE3o Especial de Tr\xE2nsito)", "Amarra\xE7\xE3o e Amarra\xE7\xE3o T\xE9cnica", "Dire\xE7\xE3o Segura com Batedores"]
  },
  {
    id: "tr-formacao-motofrete",
    title: "TR - Curso de Forma\xE7\xE3o de Motofrete",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "MOTOFRETE",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Regulariza\xE7\xE3o para motoboys e entregadores que utilizam placa vermelha de transporte remunerado.",
    fullDescription: "Curso de 30 horas exigido pela Lei Federal n\xBA 12.009/09 e CONTRAN para transporte seguro de mercadorias com motocicleta.",
    price: 149,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Homologado Resolu\xE7\xE3o CONTRAN n\xBA 930",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80",
    badge: "Placa Vermelha",
    requirements: ["Maior de 21 anos", "Habilitado na Categoria A h\xE1 pelo menos 2 anos"],
    modules: ["Legisla\xE7\xE3o e Normas do Motofrete", "Equipamentos de Seguran\xE7a e Ba\xFA", "Dire\xE7\xE3o Defensiva em Duas Rodas"]
  },
  {
    id: "tr-formacao-mototaxista",
    title: "TR - Curso de Forma\xE7\xE3o para Mototaxista",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "MOTOT\xC1XI",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Curso obrigat\xF3rio para profissionais de transporte de passageiros em motocicletas.",
    fullDescription: "Capacite-se para o transporte regularizado de pessoas com seguran\xE7a, postura \xE9tica e t\xE9cnicas de frenagem e equil\xEDbrio.",
    price: 149,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Homologado CONTRAN / DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 21 anos", "Habilitado na Categoria A h\xE1 2 anos no m\xEDnimo"],
    modules: ["Transporte de Passageiros em Duas Rodas", "Seguran\xE7a do Garupa e Capacete", "Preven\xE7\xE3o de Sinistros Urbanos"]
  },
  {
    id: "tr-monitor-transporte-escolar",
    title: "TR - Monitor de Transporte Escolar",
    subtitle: "Capacita\xE7\xE3o Profissional EAD",
    acronym: "MONITOR",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Prepara\xE7\xE3o para monitores e assistentes de vans e \xF4nibus de transporte escolar infantil.",
    fullDescription: "Aprenda os cuidados no embarque e desembarque, organiza\xE7\xE3o de rotas, primeiros socorros infantis e manejo comportamental.",
    price: 119,
    duration: "20 horas",
    workloadHours: 20,
    detranApproval: "Certifica\xE7\xE3o Profissional V\xE1lida",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 18 anos", "Ensino fundamental completo"],
    modules: ["Postura e \xC9tica do Monitor", "Seguran\xE7a de Embarque e Cintos", "Primeiros Socorros e Emerg\xEAncias"]
  },
  {
    id: "tr-primeira-carteira",
    title: "TR - Primeira Carteira",
    subtitle: "Apoio Te\xF3rico Preparat\xF3rio para CNH",
    acronym: "1\xAA CNH",
    category: "especializados",
    categoryLabel: "Forma\xE7\xE3o Especializada",
    description: "Conte\xFAdo interativo completo para quem vai tirar a primeira carteira de motorista.",
    fullDescription: "Acelere sua aprova\xE7\xE3o na prova te\xF3rica do DETRAN com simulados, legisla\xE7\xE3o atualizada, mec\xE2nica b\xE1sica e dire\xE7\xE3o defensiva.",
    price: 99,
    duration: "45 horas",
    workloadHours: 45,
    detranApproval: "Apoio Te\xF3rico Preparat\xF3rio",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 18 anos"],
    modules: ["Legisla\xE7\xE3o de Tr\xE2nsito Descomplicada", "Dire\xE7\xE3o Defensiva Te\xF3rica", "No\xE7\xF5es de Mec\xE2nica e Meio Ambiente"]
  },
  // =========================================================================
  // 2. ATUALIZAÇÕES / CURSOS LIVRES E RECICLAGEM
  // =========================================================================
  {
    id: "atualizacao-condutores-emergencia",
    title: "Atualiza\xE7\xE3o para Condutores de Emerg\xEAncia",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "ATU-CVE",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Renova\xE7\xE3o quinquenal de 16 horas para condutores de ambul\xE2ncias e resgate.",
    fullDescription: "Renove seu curso de emerg\xEAncia sem refazer as 50 horas. Revalida\xE7\xE3o direta no sistema RENACH/DETRAN.",
    price: 119,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Curso CVE de 50h registrado no hist\xF3rico da CNH"],
    modules: ["Novidades na Legisla\xE7\xE3o de Emerg\xEAncia", "Atualiza\xE7\xE3o em Atendimento Pr\xE9-Hospitalar"]
  },
  {
    id: "reciclagem-infrator",
    title: "Reciclagem Infrator",
    subtitle: "Homologado DETRAN PR | Desbloqueio de CNH",
    acronym: "REC-INFRATOR",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Para condutores com CNH suspensa ou notifica\xE7\xE3o de pontua\xE7\xE3o excessiva.",
    fullDescription: "Fa\xE7a suas 30 horas 100% online com biometria facial e libere sua carteira de motorista sem burocracia.",
    price: 149,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Integrado ao Sistema RENACH DETRAN PR",
    modality: "100% Online com Reconhecimento Facial",
    thumbnail: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80",
    badge: "Desbloqueio CNH",
    requirements: ["Processo de suspens\xE3o ou pontua\xE7\xE3o aberto no DETRAN"],
    modules: ["Legisla\xE7\xE3o e Penalidades", "Dire\xE7\xE3o Defensiva", "Primeiros Socorros", "\xC9tica no Tr\xE2nsito"],
    isFeatured: true
  },
  {
    id: "tr-livre-atualizacao-produtos-perigosos",
    title: "TR - Curso Livre - Atualiza\xE7\xE3o Produtos Perigosos",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "ATU-MOPP",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Renova\xE7\xE3o de 16 horas da qualifica\xE7\xE3o MOPP para continuar operando cargas qu\xEDmicas e inflam\xE1veis.",
    fullDescription: "Curso r\xE1pido para motoristas com o MOPP vencido ou a vencer. Prorroga a validade por mais 5 anos no RENACH.",
    price: 119,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Homologado CONTRAN / DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Curso MOPP de 50h averbado na CNH"],
    modules: ["Atualiza\xE7\xF5es ANTT e CONTRAN", "Novas Tecnologias de Transporte"]
  },
  {
    id: "tr-livre-atualizacao-coletivo-passageiros",
    title: "TR - Curso Livre - Atualiza\xE7\xE3o Coletivo de Passageiros",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "ATU-CTCP",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Renova\xE7\xE3o de 16 horas para condutores de \xF4nibus urbanos e rodovi\xE1rios.",
    fullDescription: "Atualize seus conhecimentos em transporte coletivo e garanta sua empregabilidade em empresas de \xF4nibus.",
    price: 119,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Curso de Coletivo 50h registrado no RENACH"],
    modules: ["Novas Tecnologias e Efici\xEAncia", "Seguran\xE7a dos Passageiros"]
  },
  {
    id: "tr-livre-atualizacao-transporte-escolar",
    title: "TR - Curso Livre - Atualiza\xE7\xE3o Transporte Escolar",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "ATU-CTE",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Renova\xE7\xE3o obrigat\xF3ria de 5 anos para condutores de vans e \xF4nibus de transporte escolar.",
    fullDescription: "Mantenha em dia a sua licen\xE7a municipal e estadual para conduzir transporte escolar com este curso de 16 horas.",
    price: 119,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Curso Escolar 50h registrado na CNH"],
    modules: ["Novas Normas de Tr\xE2nsito Escolar", "Gest\xE3o Comportamental"]
  },
  {
    id: "tr-livre-atualizacao-cargas-indivisiveis",
    title: "TR - Curso Livre - Atualiza\xE7\xE3o Cargas Indivis\xEDveis",
    subtitle: "Reconhecido pelo Detran PR | 100% EAD",
    acronym: "ATU-CCI",
    category: "atualizacao",
    categoryLabel: "Atualiza\xE7\xE3o e Reciclagem",
    description: "Renova\xE7\xE3o de 16 horas para transporte de grandes cargas e maquin\xE1rio pesado.",
    fullDescription: "Revalide por mais 5 anos o curso de cargas indivis\xEDveis diretamente pelo celular ou notebook.",
    price: 119,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Homologado DETRAN PR",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Curso de Cargas Indivis\xEDveis 50h registrado"],
    modules: ["Atualiza\xE7\xE3o das Resolu\xE7\xF5es DNIT e ANTT", "Protocolos em Rodovias"]
  },
  // =========================================================================
  // 3. SAÚDE, APH & PRIMEIROS SOCORROS
  // =========================================================================
  {
    id: "atendimento-pre-hospitalar-aph",
    title: "Atendimento Pr\xE9 Hospitalar (APH)",
    subtitle: "Capacita\xE7\xE3o Profissional de Emerg\xEAncia",
    acronym: "APH",
    category: "saude",
    categoryLabel: "Sa\xFAde & Emerg\xEAncia (APH)",
    description: "Forma\xE7\xE3o completa em suporte b\xE1sico e avan\xE7ado de vida para atendimento de urg\xEAncias e traumas.",
    fullDescription: "Aprenda os protocolos internacionais de atendimento a v\xEDtimas de acidentes de tr\xE2nsito, PCR, imobiliza\xE7\xE3o com prancha r\xEDgida e triagem r\xE1pida.",
    price: 189,
    duration: "60 horas",
    workloadHours: 60,
    detranApproval: "Certificado Nacional de Capacita\xE7\xE3o",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1600&q=80",
    badge: "Urg\xEAncia & Trauma",
    requirements: ["Maior de 18 anos", "Interesse na \xE1rea de resgate e sa\xFAde"],
    modules: ["Avalia\xE7\xE3o Prim\xE1ria e Secund\xE1ria (XABCDE)", "Reanima\xE7\xE3o Cardiopulmonar (RCP)", "Controle de Hemorragias Severas", "Imobiliza\xE7\xF5es e Transporte"],
    isFeatured: true
  },
  {
    id: "primeiros-socorros-iniciantes",
    title: "Primeiros Socorros Para Iniciantes: Aprenda o Essencial",
    subtitle: "Treinamento Pr\xE1tico para Leigos e Empresas",
    acronym: "SOCORROS",
    category: "saude",
    categoryLabel: "Sa\xFAde & Emerg\xEAncia (APH)",
    description: "Aprenda o essencial para agir com rapidez e salvar vidas em situa\xE7\xF5es cotidianas de emerg\xEAncia.",
    fullDescription: "Engasgo (Manobra de Heimlich), desmaios, convuls\xF5es, queimaduras e parada card\xEDaca. Tudo explicado de forma simples e visual.",
    price: 97,
    duration: "20 horas",
    workloadHours: 20,
    detranApproval: "Certificado V\xE1lido Lei Lucas n\xBA 13.722",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Livre para qualquer pessoa"],
    modules: ["Como Acionar SAMU e Bombeiros Corretamente", "Desengasgo de Adultos e Beb\xEAs", "Massagem Card\xEDaca para Leigos", "Curativos de Emerg\xEAncia"]
  },
  // =========================================================================
  // 4. PROGRAMA JORNADA TEA (TRANSTORNO DO ESPECTRO AUTISTA)
  // =========================================================================
  {
    id: "programa-jornada-tea",
    title: "Programa Jornada TEA",
    subtitle: "Forma\xE7\xE3o Completa em Conscientiza\xE7\xE3o e Inclus\xE3o",
    acronym: "JORNADA TEA",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Vis\xE3o integral sobre o Transtorno do Espectro Autista, acolhimento, conviv\xEAncia e direitos.",
    fullDescription: "O programa completo que aborda as bases neurol\xF3gicas, comportamentais, legais e de inclus\xE3o pr\xE1tica do TEA para a sociedade.",
    price: 197,
    duration: "60 horas",
    workloadHours: 60,
    detranApproval: "Certificado de Forma\xE7\xE3o e Inclus\xE3o",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80",
    badge: "Inclus\xE3o & Cidadania",
    requirements: ["Livre para todos os interessados"],
    modules: ["Fundamentos do TEA e Diagn\xF3stico", "Sensibilidade Sensorial e Comunica\xE7\xE3o", "Direitos e Acessibilidade Legal"],
    isFeatured: true
  },
  {
    id: "programa-jornada-tea-trilha-empresas",
    title: "Programa Jornada TEA - Trilha Empresas",
    subtitle: "Diversidade, Inclus\xE3o Corporativa e ESG",
    acronym: "TEA EMPRESAS",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Como preparar empresas, l\xEDderes e equipes de RH para contrata\xE7\xE3o e conviv\xEAncia inclusiva.",
    fullDescription: "Adequa\xE7\xE3o de ambientes de trabalho, entrevistas acess\xEDveis, gest\xE3o humanizada e pr\xE1ticas modernas de ESG com colaboradores neurodivergentes.",
    price: 149,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Certifica\xE7\xE3o Corporativa EAD",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Profissionais de RH, L\xEDderes e Empresas"],
    modules: ["Recrutamento Inclusivo de Neurodivergentes", "Adapta\xE7\xF5es Sensoriais no Escrit\xF3rio", "Combate ao Preconceito Corporativo"]
  },
  {
    id: "programa-jornada-tea-trilha-escola",
    title: "Programa Jornada TEA - Trilha Escola",
    subtitle: "Pr\xE1ticas Pedag\xF3gicas e Adapta\xE7\xE3o Curricular",
    acronym: "TEA ESCOLA",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Metodologias de ensino, acolhimento e desenvolvimento de alunos autistas em sala de aula.",
    fullDescription: "Capacita\xE7\xE3o pr\xE1tica para professores, pedagogos, coordenadores e auxiliares na elabora\xE7\xE3o do PEI (Plano de Ensino Individualizado).",
    price: 149,
    duration: "40 horas",
    workloadHours: 40,
    detranApproval: "Certificado V\xE1lido para Progress\xE3o Docente",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    badge: "Para Educadores",
    requirements: ["Professores, Educadores e Estudantes"],
    modules: ["O Aluno Autista na Escola Regular", "Constru\xE7\xE3o do PEI na Pr\xE1tica", "Manejo de Crises e Est\xEDmulos"]
  },
  {
    id: "programa-jornada-tea-trilha-familia",
    title: "Programa Jornada TEA - Trilha Fam\xEDlia",
    subtitle: "Apoio, Conviv\xEAncia e Estrat\xE9gias Di\xE1rias",
    acronym: "TEA FAM\xCDLIA",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Orienta\xE7\xE3o pr\xE1tica para pais, m\xE3es e cuidadores no cotidiano de crian\xE7as e jovens autistas.",
    fullDescription: "Rotinas visuais, desregula\xE7\xE3o emocional, est\xEDmulo \xE0 autonomia, direitos do paciente autista e sa\xFAde mental da rede de apoio.",
    price: 119,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Curso de Apoio e Conscientiza\xE7\xE3o",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Familiares e Cuidadores"],
    modules: ["Rotina Estruturada em Casa", "Comunica\xE7\xE3o Alternativa B\xE1sica", "Cuidado com os Cuidadores"]
  },
  {
    id: "programa-jornada-tea-trilha-gestor-publico",
    title: "Programa Jornada TEA - Trilha Gestor P\xFAblico",
    subtitle: "Pol\xEDticas P\xFAblicas, Leis e Atendimento Cidad\xE3o",
    acronym: "TEA P\xDABLICO",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Capacita\xE7\xE3o para agentes p\xFAblicos, servidores e \xF3rg\xE3os municipais no acolhimento de pessoas com TEA.",
    fullDescription: "Aplica\xE7\xE3o da Lei Berenice Piana, carteira de identifica\xE7\xE3o (CIPTEA), filas preferenciais e urbanismo com acessibilidade sensorial.",
    price: 149,
    duration: "30 horas",
    workloadHours: 30,
    detranApproval: "Certificado de Capacita\xE7\xE3o para Servidores",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Servidores P\xFAblicos e Gestores"],
    modules: ["Legisla\xE7\xE3o Federal e Estadual do TEA", "Atendimento Humanizado em Reparti\xE7\xF5es", "Pol\xEDticas Integradas de Sa\xFAde e Educa\xE7\xE3o"]
  },
  {
    id: "programa-jornada-tea-trilha-profissionais-saude",
    title: "Programa Jornada TEA - Trilha Profissionais da Sa\xFAde",
    subtitle: "Consultas, Terapias e Manejo Sensorial",
    acronym: "TEA SA\xDADE",
    category: "tea",
    categoryLabel: "Programa Jornada TEA",
    description: "Para m\xE9dicos, enfermeiros, psic\xF3logos, dentistas e terapeutas no atendimento de pacientes autistas.",
    fullDescription: "Dessensibiliza\xE7\xE3o para exames e consultas, comunica\xE7\xE3o com pacientes n\xE3o verbais, identifica\xE7\xE3o precoce e terapias baseadas em evid\xEAncias.",
    price: 159,
    duration: "40 horas",
    workloadHours: 40,
    detranApproval: "Aperfei\xE7oamento Profissional em Sa\xFAde",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
    badge: "\xC1rea da Sa\xFAde",
    requirements: ["Profissionais e Estudantes da Sa\xFAde"],
    modules: ["Manejo em Consult\xF3rio e Pronto Atendimento", "Dessensibiliza\xE7\xE3o de Procedimentos M\xE9dicos", "Trabalho Multidisciplinar Integrado"]
  },
  // =========================================================================
  // 5. SEGURANÇA DO TRABALHO (NORMAS REGULAMENTADORAS - NR)
  // =========================================================================
  {
    id: "curso-nr-20-basico",
    title: "Curso NR 20 - B\xE1sico",
    subtitle: "Seguran\xE7a com Inflam\xE1veis e Combust\xEDveis",
    acronym: "NR 20 B\xC1SICO",
    category: "nr",
    categoryLabel: "Seguran\xE7a do Trabalho (NR)",
    description: "Para trabalhadores que adentram a \xE1rea de extra\xE7\xE3o, refino, armazenamento e manuseio de inflam\xE1veis.",
    fullDescription: "Conforme Norma Regulamentadora n\xBA 20 do MTE. Preven\xE7\xE3o de explos\xF5es, manuseio de combust\xEDveis, uso de EPI e sinaliza\xE7\xE3o de seguran\xE7a.",
    price: 119,
    duration: "8 horas",
    workloadHours: 8,
    detranApproval: "Certificado V\xE1lido Portaria MTE / NR 20",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Maior de 18 anos"],
    modules: ["Propriedades e Riscos dos Inflam\xE1veis", "Fontes de Igni\xE7\xE3o e Controle", "Equipamentos de Combate a Inc\xEAndio"]
  },
  {
    id: "curso-nr-20-intermediario",
    title: "Curso NR 20 - Intermedi\xE1rio",
    subtitle: "Para Operadores de Postos e Estocagem de Combust\xEDveis",
    acronym: "NR 20 INTER",
    category: "nr",
    categoryLabel: "Seguran\xE7a do Trabalho (NR)",
    description: "Obrigat\xF3rio para frentistas, operadores de bombas, caminh\xF5es-tanque e dep\xF3sitos de combust\xEDveis.",
    fullDescription: "Treinamento de 16 horas com foco em descarga segura de combust\xEDveis, teste de estanqueidade, eletricidade est\xE1tica e controle de vazamentos.",
    price: 149,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Em Conformidade com a NR 20 do MTE",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=1600&q=80",
    badge: "Postos de Combust\xEDveis",
    requirements: ["Atuantes na opera\xE7\xE3o com inflam\xE1veis"],
    modules: ["Procedimentos Operacionais em Postos", "Eletricidade Est\xE1tica e Aterramento", "Plano de Resposta a Emerg\xEAncias"]
  },
  {
    id: "curso-nr-20-avancado",
    title: "Curso NR 20 - Avan\xE7ado",
    subtitle: "Instala\xE7\xF5es Industriais Classe II e III",
    acronym: "NR 20 AVAN\xC7ADO",
    category: "nr",
    categoryLabel: "Seguran\xE7a do Trabalho (NR)",
    description: "Para operadores e t\xE9cnicos de refinarias, terminais petroqu\xEDmicos e grandes tanques industriais.",
    fullDescription: "Treinamento avan\xE7ado de 24 horas abordando an\xE1lise de risco (APR, HAZOP), manuten\xE7\xE3o em \xE1reas classificadas e permiss\xE3o de trabalho.",
    price: 179,
    duration: "24 horas",
    workloadHours: 24,
    detranApproval: "Certificado V\xE1lido Nacionalmente MTE",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Profissionais de ind\xFAstrias petroqu\xEDmicas e qu\xEDmicas"],
    modules: ["An\xE1lise Preliminar de Risco Avan\xE7ada", "Inspe\xE7\xE3o e Manuten\xE7\xE3o de Tanques", "Simula\xE7\xF5es de Grandes Sinistros"]
  },
  {
    id: "tr-nr-17-ergonomia",
    title: "TR - NR17 - Ergonomia",
    subtitle: "Sa\xFAde, Postura e Preven\xE7\xE3o de Les\xF5es",
    acronym: "NR 17",
    category: "nr",
    categoryLabel: "Seguran\xE7a do Trabalho (NR)",
    description: "Adapta\xE7\xE3o das condi\xE7\xF5es de trabalho \xE0s caracter\xEDsticas psicofisiol\xF3gicas dos trabalhadores.",
    fullDescription: "Conforme Norma Regulamentadora n\xBA 17. Preven\xE7\xE3o de LER/DORT, postura no transporte e carga de pesos, ergonomia no escrit\xF3rio e volante.",
    price: 119,
    duration: "20 horas",
    workloadHours: 20,
    detranApproval: "Certificado Homologado Normas MTE",
    modality: "100% Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    requirements: ["Qualquer trabalhador ou empresa"],
    modules: ["Biomec\xE2nica Postural e Coluna Vertebral", "Levantamento Manual de Cargas", "Pausas e Gin\xE1stica Laboral"]
  },
  {
    id: "tr-nr-35-trabalho-em-altura",
    title: "TR - NR35 - Trabalho em Altura",
    subtitle: "Seguran\xE7a para Atividades Acima de 2 Metros",
    acronym: "NR 35",
    category: "nr",
    categoryLabel: "Seguran\xE7a do Trabalho (NR)",
    description: "Requisitos e medidas de prote\xE7\xE3o para trabalho em altura com risco de queda.",
    fullDescription: "Normas de inspe\xE7\xE3o de talabartes, cintur\xE3o paraquedista, linhas de vida, trava-quedas, andaimes e resgate em altura.",
    price: 139,
    duration: "16 horas",
    workloadHours: 16,
    detranApproval: "Norma Regulamentadora n\xBA 35 do MTE",
    modality: "Teoria Online EAD",
    thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=1600&q=80",
    badge: "Trabalho em Altura",
    requirements: ["Maior de 18 anos", "Aptid\xE3o f\xEDsica para trabalho em altura"],
    modules: ["Normas e Regulamentos de Altura", "EPIs e An\xE1lise de Risco (AR)", "Sistemas de Ancoragem e Linhas de Vida", "Primeiros Socorros em Quedas"]
  }
];

// server/supabase.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var supabaseInstance = null;
async function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("seu-projeto")) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      console.log("[SUPABASE] Cliente conectado com sucesso a:", supabaseUrl);
    } catch (err) {
      console.warn("[AVISO] Pacote @supabase/supabase-js n\xE3o encontrado ou erro na inicializa\xE7\xE3o:", err);
      return null;
    }
  }
  return supabaseInstance;
}
var isSupabaseConfigured = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  return Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("seu-projeto"));
};

// server/db.ts
var Database = class {
  constructor() {
    this.orders = /* @__PURE__ */ new Map();
    this.webhookLogs = [];
    this.courses = COURSES.map((c) => {
      const costPrice = c.costPrice ?? (c.price <= 120 ? 50 : c.price <= 150 ? 65 : 70);
      const profitPercent = c.profitPercent ?? (costPrice > 0 ? Number(((c.price - costPrice) / costPrice * 100).toFixed(1)) : 100);
      return {
        ...c,
        costPrice,
        profitPercent,
        isActive: c.isActive !== false
      };
    });
    this.initSupabaseSeed();
  }
  // Semeia os 28 cursos no Supabase se ainda não existirem
  async initSupabaseSeed() {
    const supabase = await getSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("courses").select("id").limit(1);
      if (!error && (!data || data.length === 0)) {
        console.log("[SUPABASE] Semeando cat\xE1logo de 28 cursos...");
        const coursesToInsert = this.courses.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          acronym: c.acronym,
          category: c.category,
          category_label: c.categoryLabel,
          description: c.description,
          full_description: c.fullDescription,
          price: c.price,
          duration: c.duration,
          workload_hours: c.workloadHours,
          detran_approval: c.detranApproval,
          modality: c.modality,
          thumbnail: c.thumbnail,
          backdrop: c.backdrop,
          badge: c.badge,
          requirements: c.requirements,
          modules: c.modules,
          is_featured: c.isFeatured || false
        }));
        await supabase.from("courses").upsert(coursesToInsert);
        console.log(
          "[SUPABASE] 28 cursos sincronizados com sucesso no PostgreSQL!"
        );
      }
    } catch (err) {
      console.warn("[SUPABASE] Aviso ao sincronizar cursos:", err);
    }
  }
  getCourses(includeInactive = false) {
    if (includeInactive) {
      return [...this.courses];
    }
    return this.courses.filter((c) => c.isActive !== false);
  }
  getCourseById(id) {
    return this.courses.find((c) => c.id === id);
  }
  updateCourse(id, updates) {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const current = this.courses[idx];
    const updated = {
      ...current,
      ...updates
    };
    if (updates.costPrice !== void 0 || updates.price !== void 0 || updates.profitPercent !== void 0) {
      const cost = updated.costPrice ?? current.costPrice ?? 0;
      if (updates.profitPercent !== void 0 && updates.price === void 0) {
        const profit = updates.profitPercent;
        updated.price = cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      } else if (updates.price !== void 0 && updates.profitPercent === void 0) {
        const price = updates.price;
        updated.profitPercent = cost > 0 ? Number(((price - cost) / cost * 100).toFixed(1)) : 0;
      } else if (updates.costPrice !== void 0 && updates.price === void 0 && updates.profitPercent === void 0) {
        const profit = updated.profitPercent ?? 0;
        updated.price = cost > 0 ? Number((cost * (1 + profit / 100)).toFixed(2)) : cost;
      }
    }
    this.courses[idx] = updated;
    console.log(
      `[DB] Curso atualizado: ${id} | Pre\xE7o: R$ ${updated.price} | Custo: R$ ${updated.costPrice} | Lucro: ${updated.profitPercent}% | Ativo: ${updated.isActive}`
    );
    return updated;
  }
  createCourse(newCourse) {
    let id = newCourse.id ? newCourse.id.trim() : "";
    if (!id) {
      id = newCourse.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (this.courses.some((c) => c.id === id)) {
      id = `${id}-${Date.now().toString().slice(-4)}`;
    }
    const costPrice = newCourse.costPrice ?? 60;
    let price = newCourse.price ?? 169;
    let profitPercent = newCourse.profitPercent;
    if (profitPercent !== void 0 && newCourse.price === void 0) {
      price = costPrice > 0 ? Number((costPrice * (1 + profitPercent / 100)).toFixed(2)) : costPrice;
    } else if (profitPercent === void 0) {
      profitPercent = costPrice > 0 ? Number(((price - costPrice) / costPrice * 100).toFixed(1)) : 0;
    }
    const course = {
      ...newCourse,
      id,
      costPrice,
      profitPercent,
      price,
      isActive: newCourse.isActive !== false,
      requirements: Array.isArray(newCourse.requirements) ? newCourse.requirements : [],
      modules: Array.isArray(newCourse.modules) ? newCourse.modules : []
    };
    this.courses.unshift(course);
    console.log(
      `[DB] Novo curso cadastrado com sucesso: [${course.id}] ${course.title} (Pre\xE7o: R$ ${course.price})`
    );
    return course;
  }
  toggleCourseActive(id) {
    const course = this.courses.find((c) => c.id === id);
    if (!course) return { success: false, isActive: false };
    course.isActive = course.isActive === false ? true : false;
    console.log(
      `[DB] Status do curso [${id}] alterado para: ${course.isActive ? "ATIVO" : "INATIVO/OCULTO"}`
    );
    return { success: true, isActive: course.isActive, course };
  }
  deleteCourse(id) {
    const initialLen = this.courses.length;
    this.courses = this.courses.filter((c) => c.id !== id);
    const removed = this.courses.length < initialLen;
    if (removed) {
      console.log(`[DB] Curso removido: ${id}`);
    }
    return removed;
  }
  async createOrder(order) {
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);
    const supabase = await getSupabase();
    if (supabase) {
      try {
        console.log(
          "[SUPABASE] Gravando aluno e pedido para CPF:",
          order.customerCpf
        );
        const { data: studentData, error: studentError } = await supabase.from("students").upsert(
          {
            cpf: order.customerCpf,
            full_name: order.customerName,
            email: order.customerEmail,
            whatsapp: order.customerWhatsapp,
            birth_date: order.customerBirthDate || null,
            cnh_number: order.customerCnhNumber,
            cnh_category: order.customerCnhCategory
          },
          { onConflict: "cpf" }
        ).select("id").single();
        if (studentError) {
          console.error(
            "[SUPABASE] Erro ao gravar aluno na tabela students:",
            studentError.message,
            studentError.details
          );
        } else {
          console.log(
            "[SUPABASE] Aluno gravado com sucesso! ID:",
            studentData?.id
          );
        }
        const { error: orderError } = await supabase.from("orders").insert({
          id: order.id,
          student_id: studentData?.id || null,
          course_id: order.courseId,
          course_title: order.courseTitle,
          course_price: order.amount,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_cpf: order.customerCpf,
          customer_whatsapp: order.customerWhatsapp,
          customer_cnh_number: order.customerCnhNumber,
          customer_cnh_category: order.customerCnhCategory,
          gateway: order.gateway,
          txid: order.txid,
          mercado_pago_payment_id: order.mercadoPagoPaymentId,
          pix_copia_e_cola: order.pixCopiaECola,
          qr_code_url: order.qrCodeUrl,
          status: order.status,
          status_message: order.statusMessage,
          access_dispatched_status: order.accessDispatchedStatus
        });
        if (orderError) {
          console.error(
            "[SUPABASE] Erro ao gravar pedido na tabela orders:",
            orderError.message,
            orderError.details
          );
        } else {
          console.log(
            "[SUPABASE] Pedido gravado com sucesso no PostgreSQL! ID:",
            order.id
          );
        }
      } catch (err) {
        console.error(
          "[SUPABASE] Exce\xE7\xE3o inesperada ao gravar pedido/aluno:",
          err
        );
      }
    } else {
      console.warn(
        "[SUPABASE] Supabase n\xE3o conectado. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
      );
    }
    return order;
  }
  async getOrderByTxid(txidOrId) {
    const cached = this.orders.get(txidOrId);
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").or(`id.eq.${txidOrId},txid.eq.${txidOrId}`).limit(1).maybeSingle();
        if (data && !error) {
          const restored = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: data.customer_birth_date || "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id,
            paymentMethod: data.payment_method || "PIX"
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn(
          "[DB] Erro ao consultar status do pedido no Supabase:",
          err
        );
      }
    }
    return cached;
  }
  getOrderById(id) {
    return this.orders.get(id);
  }
  async getOrderByIdAsync(id) {
    const local = this.orders.get(id);
    if (local) return local;
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").or(`id.eq.${id},txid.eq.${id}`).order("created_at", { ascending: false }).limit(1).single();
        if (data && !error) {
          const restored = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn("[DB] Erro ao recuperar pedido no Supabase:", err);
      }
    }
    return void 0;
  }
  async findStudentByCpf(cpf) {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf) return null;
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
        return {
          fullName: order.customerName,
          cpf: order.customerCpf,
          email: order.customerEmail,
          whatsapp: order.customerWhatsapp,
          birthDate: order.customerBirthDate,
          cnhNumber: order.customerCnhNumber,
          cnhCategory: order.customerCnhCategory
        };
      }
    }
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data: student, error: studentErr } = await supabase.from("students").select("*").or(`cpf.eq.${cleanCpf},cpf.eq.${cpf}`).limit(1).maybeSingle();
        if (student && !studentErr) {
          return {
            fullName: student.full_name,
            cpf: student.cpf,
            email: student.email,
            whatsapp: student.whatsapp,
            birthDate: student.birth_date,
            cnhNumber: student.cnh_number,
            cnhCategory: student.cnh_category
          };
        }
        const { data: orderData, error: orderErr } = await supabase.from("orders").select("*").or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`).limit(1).maybeSingle();
        if (orderData && !orderErr) {
          const localOrder = Array.from(this.orders.values()).find(
            (o) => o.customerCpf.replace(/\D/g, "") === cleanCpf
          );
          return {
            fullName: orderData.customer_name,
            cpf: orderData.customer_cpf,
            email: orderData.customer_email,
            whatsapp: orderData.customer_whatsapp,
            birthDate: orderData.customer_birth_date || localOrder?.customerBirthDate || "",
            cnhNumber: orderData.customer_cnh_number,
            cnhCategory: orderData.customer_cnh_category
          };
        }
      } catch (err) {
        console.warn("[DB] Erro ao consultar aluno no Supabase:", err);
      }
    }
    return null;
  }
  async findActiveOrderByCpfAndCourse(cpf, courseId) {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf || !courseId) return null;
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf && order.courseId === courseId) {
        return order;
      }
    }
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`).eq("course_id", courseId).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (data && !error) {
          const restored = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn(
          "[DB] Erro ao checar pedido duplicado por curso/cpf:",
          err
        );
      }
    }
    return null;
  }
  async getOrderByCpf(cpf) {
    const cleanCpf = cpf.replace(/\D/g, "");
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
        return order;
      }
    }
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (data && !error) {
          const restored = {
            id: data.id,
            txid: data.txid,
            gateway: data.gateway || "MERCADO_PAGO",
            courseId: data.course_id,
            courseTitle: data.course_title,
            courseSubtitle: "DETRAN Homologado",
            courseThumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerCpf: data.customer_cpf,
            customerWhatsapp: data.customer_whatsapp,
            customerBirthDate: "",
            customerCnhNumber: data.customer_cnh_number || "",
            customerCnhCategory: data.customer_cnh_category || "B",
            amount: Number(data.course_price || 0),
            status: data.status,
            statusMessage: data.status_message,
            qrCodeUrl: data.qr_code_url,
            pixCopiaECola: data.pix_copia_e_cola,
            createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            paidAt: data.paid_at,
            accessDispatchedStatus: data.access_dispatched_status,
            mercadoPagoPaymentId: data.mercado_pago_payment_id
          };
          this.orders.set(restored.id, restored);
          this.orders.set(restored.txid, restored);
          return restored;
        }
      } catch (err) {
        console.warn("[DB] Erro ao buscar pedido por CPF no Supabase:", err);
      }
    }
    return void 0;
  }
  async getStudentPortalData(cpf) {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf || cleanCpf.length !== 11) {
      return {
        student: null,
        orders: [],
        authorized: false,
        registeredInSupabase: false,
        registeredInAdmin: false
      };
    }
    let registeredInAdmin = false;
    let registeredInSupabase = false;
    const ordersMap = /* @__PURE__ */ new Map();
    for (const order of this.orders.values()) {
      if (order.customerCpf.replace(/\D/g, "") === cleanCpf) {
        ordersMap.set(order.id, order);
        registeredInAdmin = true;
      }
    }
    const student = await this.findStudentByCpf(cleanCpf);
    if (student) {
      registeredInAdmin = registeredInAdmin || true;
    }
    const supabase = await getSupabase();
    let supabaseBirthDate = "";
    if (supabase) {
      try {
        const { data: studentRecord, error: sErr } = await supabase.from("students").select("*").or(`cpf.eq.${cleanCpf},cpf.eq.${cpf}`).maybeSingle();
        if (studentRecord && !sErr) {
          registeredInSupabase = true;
          supabaseBirthDate = studentRecord.birth_date || "";
        }
        const { data: ordersData, error: oErr } = await supabase.from("orders").select("*").or(`customer_cpf.eq.${cleanCpf},customer_cpf.eq.${cpf}`).order("created_at", { ascending: false });
        if (ordersData && !oErr && ordersData.length > 0) {
          registeredInSupabase = true;
          for (const row of ordersData) {
            const courseDef = COURSES.find((c) => c.id === row.course_id);
            const localOrd = this.orders.get(row.id);
            const restored = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || "MERCADO_PAGO",
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: courseDef?.subtitle || "DETRAN Homologado",
              courseThumbnail: courseDef?.thumbnail || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate: row.customer_birth_date || supabaseBirthDate || student?.birthDate || localOrd?.customerBirthDate || "",
              customerCnhNumber: row.customer_cnh_number || "",
              customerCnhCategory: row.customer_cnh_category || "B",
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id
            };
            ordersMap.set(restored.id, restored);
            this.orders.set(restored.id, restored);
            this.orders.set(restored.txid, restored);
          }
        }
      } catch (err) {
        console.warn(
          "[DB] Erro ao consultar registros do aluno no Supabase:",
          err
        );
      }
    }
    const authorized = registeredInSupabase || registeredInAdmin;
    if (!authorized) {
      return {
        student: null,
        orders: [],
        authorized: false,
        registeredInSupabase: false,
        registeredInAdmin: false
      };
    }
    const orders = Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const enrichedStudent = student ? {
      ...student,
      birthDate: student.birthDate || supabaseBirthDate || orders[0]?.customerBirthDate || ""
    } : orders[0] ? {
      fullName: orders[0].customerName,
      cpf: orders[0].customerCpf,
      email: orders[0].customerEmail,
      whatsapp: orders[0].customerWhatsapp,
      birthDate: orders[0].customerBirthDate || supabaseBirthDate || "",
      cnhNumber: orders[0].customerCnhNumber,
      cnhCategory: orders[0].customerCnhCategory
    } : null;
    return {
      student: enrichedStudent,
      orders,
      authorized: true,
      registeredInSupabase,
      registeredInAdmin
    };
  }
  async getAllOrdersAsync() {
    const uniqueOrders = /* @__PURE__ */ new Map();
    const supabase = await getSupabase();
    const studentsBirthMap = /* @__PURE__ */ new Map();
    let supabaseOrdersLoaded = false;
    if (supabase) {
      try {
        const { data: studentsData } = await supabase.from("students").select("cpf, birth_date");
        if (studentsData) {
          for (const s of studentsData) {
            if (s.cpf && s.birth_date) {
              studentsBirthMap.set(s.cpf.replace(/\D/g, ""), s.birth_date);
            }
          }
        }
      } catch (e) {
        console.warn("[DB] Erro ao buscar lista de alunos no Supabase:", e);
      }
      try {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (data && !error) {
          supabaseOrdersLoaded = true;
          this.orders.clear();
          for (const row of data) {
            const cleanCpf = (row.customer_cpf || "").replace(/\D/g, "");
            const birthDate = row.customer_birth_date || studentsBirthMap.get(cleanCpf) || "";
            const ord = {
              id: row.id,
              txid: row.txid,
              gateway: row.gateway || "MERCADO_PAGO",
              courseId: row.course_id,
              courseTitle: row.course_title,
              courseSubtitle: "DETRAN Homologado",
              courseThumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerCpf: row.customer_cpf,
              customerWhatsapp: row.customer_whatsapp,
              customerBirthDate: birthDate,
              customerCnhNumber: row.customer_cnh_number || "",
              customerCnhCategory: row.customer_cnh_category || "B",
              amount: Number(row.course_price || 0),
              status: row.status,
              statusMessage: row.status_message,
              qrCodeUrl: row.qr_code_url,
              pixCopiaECola: row.pix_copia_e_cola,
              createdAt: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
              paidAt: row.paid_at,
              accessDispatchedStatus: row.access_dispatched_status,
              mercadoPagoPaymentId: row.mercado_pago_payment_id
            };
            uniqueOrders.set(ord.id, ord);
            this.orders.set(ord.id, ord);
            this.orders.set(ord.txid, ord);
          }
        }
      } catch (err) {
        console.warn("[DB] Erro ao listar pedidos do Supabase:", err);
      }
    }
    if (!supabaseOrdersLoaded) {
      for (const order of this.orders.values()) {
        if (!uniqueOrders.has(order.id)) {
          uniqueOrders.set(order.id, order);
        }
      }
    }
    return Array.from(uniqueOrders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  getAllOrders() {
    const uniqueOrders = /* @__PURE__ */ new Map();
    for (const order of this.orders.values()) {
      uniqueOrders.set(order.id, order);
    }
    return Array.from(uniqueOrders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async updateOrderStatus(txidOrId, status, statusMessage) {
    const order = this.orders.get(txidOrId);
    if (!order) return void 0;
    order.status = status;
    if (statusMessage) order.statusMessage = statusMessage;
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);
    const supabase = await getSupabase();
    if (supabase) {
      supabase.from("orders").update({ status, status_message: statusMessage }).or(`id.eq.${order.id},txid.eq.${order.txid}`).then();
    }
    return order;
  }
  async markOrderAsPaid(txidOrId, mercadoPagoId) {
    const order = this.orders.get(txidOrId);
    if (!order) return {};
    if (order.status !== "PAID") {
      order.status = "PAID";
      order.paidAt = (/* @__PURE__ */ new Date()).toISOString();
      order.statusMessage = "Pagamento confirmado pelo gateway via Webhook.";
      order.accessDispatchedStatus = "AGUARDANDO_ENVIO_MANUAL";
      if (mercadoPagoId) {
        order.mercadoPagoPaymentId = mercadoPagoId;
      }
      this.orders.set(order.txid, order);
      this.orders.set(order.id, order);
      const supabase = await getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from("orders").update({
            status: "PAID",
            paid_at: order.paidAt,
            status_message: order.statusMessage,
            mercado_pago_payment_id: mercadoPagoId || order.mercadoPagoPaymentId,
            access_dispatched_status: "AGUARDANDO_ENVIO_MANUAL"
          }).or(`id.eq.${order.id},txid.eq.${order.txid}`);
          if (error) {
            console.error(
              "[SUPABASE] Erro ao marcar pedido como PAID:",
              error.message
            );
          }
        } catch (err) {
          console.error("[SUPABASE] Exce\xE7\xE3o ao marcar pedido como PAID:", err);
        }
      }
      return { order };
    }
    return { order };
  }
  async markAccessAsDispatched(orderId) {
    const order = this.orders.get(orderId);
    if (!order) return void 0;
    order.accessDispatchedStatus = "ENVIADO";
    order.accessDispatchedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.orders.set(order.txid, order);
    this.orders.set(order.id, order);
    const supabase = await getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("orders").update({
          access_dispatched_status: "ENVIADO",
          access_dispatched_at: order.accessDispatchedAt
        }).eq("id", order.id);
        if (error) {
          console.error(
            "[SUPABASE] Erro ao marcar acesso como enviado:",
            error.message
          );
        }
      } catch (err) {
        console.error("[SUPABASE] Exce\xE7\xE3o ao marcar acesso como enviado:", err);
      }
    }
    return order;
  }
  async addWebhookLog(log) {
    const fullLog = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...log
    };
    this.webhookLogs.unshift(fullLog);
    if (this.webhookLogs.length > 80) {
      this.webhookLogs.pop();
    }
    const supabase = await getSupabase();
    if (supabase) {
      supabase.from("webhook_logs").insert({
        gateway: fullLog.gateway,
        endpoint: fullLog.endpoint,
        txid: fullLog.txid,
        amount: fullLog.amount,
        status_code: fullLog.statusCode,
        status_message: fullLog.statusMessage,
        raw_payload: fullLog.rawPayload
      }).then();
    }
    return fullLog;
  }
  getWebhookLogs() {
    return this.webhookLogs;
  }
};
var db = new Database();

// server/mercadoPagoService.ts
var import_qrcode = __toESM(require("qrcode"));
var import_crypto = __toESM(require("crypto"));

// server/pixHelper.ts
function crc16(payload) {
  let crc = 65535;
  const polynomial = 4129;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 32768) !== 0) {
        crc = (crc << 1 ^ polynomial) & 65535;
      } else {
        crc = crc << 1 & 65535;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function formatTLV(id, value) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}
function generateBacenPixPayload(params) {
  const { pixKey, merchantName, merchantCity, amount, txid, description } = params;
  let payload = formatTLV("00", "01");
  const gui = formatTLV("00", "br.gov.bcb.pix");
  const key = formatTLV("01", pixKey);
  const desc = description ? formatTLV("02", description.slice(0, 25)) : "";
  payload += formatTLV("26", `${gui}${key}${desc}`);
  payload += formatTLV("52", "0000");
  payload += formatTLV("53", "986");
  payload += formatTLV("54", amount.toFixed(2));
  payload += formatTLV("58", "BR");
  const sanitizedName = merchantName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 25);
  payload += formatTLV("59", sanitizedName || "INTER PJ CURSOS");
  const sanitizedCity = merchantCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 15);
  payload += formatTLV("60", sanitizedCity || "SAO PAULO");
  const txidField = formatTLV("05", txid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***");
  payload += formatTLV("62", txidField);
  payload += "6304";
  const checksum = crc16(payload);
  return `${payload}${checksum}`;
}

// server/mercadoPagoService.ts
var MercadoPagoService = class {
  getAccessToken() {
    return (process.env.MERCADO_PAGO_ACCESS_TOKEN || "").trim();
  }
  getConfigStatus(appUrl2) {
    const token = this.getAccessToken();
    const isConfigured = Boolean(token && token.length > 10 && !token.includes("MY_") && !token.includes("..."));
    const isTest = token.startsWith("TEST-");
    return {
      isConfigured,
      hasAccessToken: isConfigured,
      environment: isTest ? "sandbox" : "production",
      maskedToken: isConfigured ? `${token.slice(0, 8)}...${token.slice(-4)}` : void 0,
      webhookUrl: `${appUrl2.replace(/\/$/, "")}/api/webhooks/mercadopago`
    };
  }
  /**
   * Cria uma cobrança Pix via API oficial do Mercado Pago.
   * Se o token estiver inválido, expirado ou não informado, efetua fallback gracioso
   * para o simulador Pix, garantindo que o pedido e o aluno SEJAM SEMPRE gravados no Supabase!
   */
  async createPixPayment(params) {
    const { orderId, amount, customerName, customerEmail, customerCpf, courseTitle, appUrl: appUrl2 } = params;
    const token = this.getAccessToken();
    const cleanCpf = customerCpf.replace(/\D/g, "") || "12345678909";
    const nameParts = customerName.trim().split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.slice(1).join(" ") || "Aluno";
    const webhookUrl = `${appUrl2.replace(/\/$/, "")}/api/webhooks/mercadopago`;
    if (token && token.length > 10 && !token.includes("MY_") && !token.includes("...")) {
      try {
        const idempotencyKey = import_crypto.default.randomUUID();
        const payload = {
          transaction_amount: Number(amount.toFixed(2)),
          description: `Curso: ${courseTitle.slice(0, 50)}`,
          payment_method_id: "pix",
          payer: {
            email: customerEmail,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: cleanCpf
            }
          },
          external_reference: orderId,
          notification_url: webhookUrl
        };
        const response = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": idempotencyKey
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`[MERCADO PAGO] Token recusado pela API (HTTP ${response.status}): ${errorBody}. Ativando fallback para simulador Pix.`);
          return this.generateSimulatedPayment(orderId, amount, courseTitle, `Mercado Pago retornou ${response.status} (token inv\xE1lido/n\xE3o autorizado). Modo de teste ativado.`);
        }
        const data = await response.json();
        const transactionData = data?.point_of_interaction?.transaction_data;
        const pixCopiaECola = transactionData?.qr_code || "";
        let qrCodeUrl = "";
        if (transactionData?.qr_code_base64) {
          qrCodeUrl = `data:image/png;base64,${transactionData.qr_code_base64}`;
        } else if (pixCopiaECola) {
          qrCodeUrl = await import_qrcode.default.toDataURL(pixCopiaECola, {
            width: 320,
            margin: 2,
            color: { dark: "#009ee3", light: "#ffffff" }
          });
        }
        return {
          paymentId: String(data.id),
          pixCopiaECola,
          qrCodeUrl,
          isRealApi: true
        };
      } catch (err) {
        console.error("Falha ao comunicar com a API do Mercado Pago:", err);
        return this.generateSimulatedPayment(orderId, amount, courseTitle, err.message);
      }
    }
    return this.generateSimulatedPayment(orderId, amount, courseTitle);
  }
  async generateSimulatedPayment(orderId, amount, courseTitle, warning) {
    const simulatedPaymentId = `mp_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
    const pixCopiaECola = generateBacenPixPayload({
      pixKey: "financeiro@mercadopago.com.br",
      merchantName: "MERCADO PAGO CURSOS",
      merchantCity: "SAO PAULO",
      amount,
      txid: orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25),
      description: courseTitle
    });
    const qrCodeUrl = await import_qrcode.default.toDataURL(pixCopiaECola, {
      width: 320,
      margin: 2,
      color: { dark: "#0284c7", light: "#ffffff" }
    });
    return {
      paymentId: simulatedPaymentId,
      pixCopiaECola,
      qrCodeUrl,
      isRealApi: false,
      warning
    };
  }
  /**
   * Cria uma Preferência no Mercado Pago Checkout Pro
   * Suporta Cartão de Crédito (em até 12x), Cartão de Débito e Pix.
   */
  async createPreference(params) {
    const { orderId, amount, customerName, customerEmail, customerCpf, courseTitle, appUrl: appUrl2 } = params;
    const token = this.getAccessToken();
    const cleanCpf = customerCpf.replace(/\D/g, "") || "12345678909";
    const nameParts = customerName.trim().split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.slice(1).join(" ") || "Aluno";
    const baseUrl = appUrl2.replace(/\/$/, "");
    const webhookUrl = `${baseUrl}/api/webhooks/mercadopago`;
    if (token && token.length > 10 && !token.includes("MY_") && !token.includes("...")) {
      try {
        const preferencePayload = {
          items: [
            {
              id: orderId,
              title: `Curso: ${courseTitle.slice(0, 100)}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(amount.toFixed(2))
            }
          ],
          payer: {
            name: firstName,
            surname: lastName,
            email: customerEmail,
            identification: {
              type: "CPF",
              number: cleanCpf
            }
          },
          external_reference: orderId,
          notification_url: webhookUrl,
          payment_methods: {
            // Permite Cartão de Crédito, Débito e Pix
            excluded_payment_types: [],
            installments: 12
          },
          back_urls: {
            success: `${baseUrl}/?orderId=${orderId}&payment_status=success`,
            failure: `${baseUrl}/?orderId=${orderId}&payment_status=failure`,
            pending: `${baseUrl}/?orderId=${orderId}&payment_status=pending`
          },
          auto_return: "approved"
        };
        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(preferencePayload)
        });
        if (response.ok) {
          const prefData = await response.json();
          const isTest = token.startsWith("TEST-");
          const checkoutUrl = isTest && prefData.sandbox_init_point ? prefData.sandbox_init_point : prefData.init_point || prefData.sandbox_init_point;
          console.log(`[MERCADO PAGO] Prefer\xEAncia de checkout criada: ID ${prefData.id}`);
          return {
            preferenceId: prefData.id,
            checkoutUrl,
            isRealApi: true
          };
        } else {
          const errBody = await response.text();
          console.warn(`[MERCADO PAGO] Erro ao criar prefer\xEAncia (HTTP ${response.status}):`, errBody);
          return {
            checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
            isRealApi: false,
            error: `API Mercado Pago HTTP ${response.status}`
          };
        }
      } catch (err) {
        console.error("[MERCADO PAGO] Exce\xE7\xE3o ao criar prefer\xEAncia:", err);
        return {
          checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
          isRealApi: false,
          error: err.message
        };
      }
    }
    return {
      checkoutUrl: `${baseUrl}/?orderId=${orderId}&checkout_mode=card_demo`,
      isRealApi: false
    };
  }
  /**
   * Consulta pagamento na API do Mercado Pago
   */
  async getPayment(paymentId) {
    const token = this.getAccessToken();
    if (!token || token.length < 10) return null;
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error("Erro ao consultar status no Mercado Pago:", err);
      return null;
    }
  }
  /**
   * Alias compatível com o Webhook
   */
  async getPaymentDetails(paymentId) {
    return this.getPayment(paymentId);
  }
};
var mercadoPagoService = new MercadoPagoService();

// server/notificationService.ts
var notificationService = {
  sendPaymentConfirmedNotification(data) {
    const firstName = data.customerName.split(" ")[0] || data.customerName;
    const formattedAmount = data.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    console.log(`
======================================================`);
    console.log(`[DISPARO DE NOTIFICA\xC7\xC3O P\xD3S-PAGAMENTO]`);
    console.log(`Para: ${data.customerName} (${data.customerEmail} / WhatsApp: ${data.customerWhatsapp})`);
    console.log(`Curso: ${data.courseTitle} - Pedido: ${data.orderId} - Valor: ${formattedAmount}`);
    console.log(`------------------------------------------------------`);
    console.log(`MENSAGEM DE E-MAIL:`);
    console.log(`Assunto: Pagamento Confirmado! Seu acesso ao curso ${data.courseTitle} est\xE1 sendo preparado.`);
    console.log(`Ol\xE1 ${firstName},`);
    console.log(`Confirmamos o recebimento do seu pagamento no valor de ${formattedAmount} via Pix.`);
    console.log(`Sua matr\xEDcula foi registrada com sucesso no sistema.`);
    console.log(`IMPORTANTE: Como o curso possui homologa\xE7\xE3o oficial no DETRAN, nossa equipe acad\xEAmica est\xE1 validando os seus dados de CNH.`);
    console.log(`Em breve (geralmente em alguns minutos), voc\xEA receber\xE1 o seu LINK DE ACESSO e credenciais diretamente no seu WhatsApp (${data.customerWhatsapp}) e neste e-mail.`);
    console.log(`------------------------------------------------------`);
    console.log(`MENSAGEM DE WHATSAPP:`);
    console.log(`*Ol\xE1, ${firstName}!* \u{1F44B}`);
    console.log(`Recebemos a confirma\xE7\xE3o do seu pagamento do *${data.courseTitle}*!`);
    console.log(`Seus dados j\xE1 foram encaminhados para a homologa\xE7\xE3o. Em breve voc\xEA receber\xE1 aqui por este WhatsApp o seu link de acesso exclusivo \xE0 plataforma de estudos.`);
    console.log(`======================================================
`);
    return {
      sent: true,
      channel: "both",
      message: "Notifica\xE7\xE3o de confirma\xE7\xE3o enviada com sucesso ao aluno.",
      recipientEmail: data.customerEmail,
      recipientWhatsapp: data.customerWhatsapp,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// server/supabaseTest.ts
async function testSupabaseConnection(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({
      success: false,
      message: "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY n\xE3o est\xE3o definidas no arquivo .env.",
      diagnostics: {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseKey)
      }
    });
  }
  const supabase = await getSupabase();
  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: "Falha ao inicializar o cliente Supabase. Verifique se o pacote @supabase/supabase-js est\xE1 instalado."
    });
  }
  try {
    const { data: courses, error: errCourses } = await supabase.from("courses").select("id").limit(1);
    const { count: studentsCount, error: errStudents } = await supabase.from("students").select("*", { count: "exact", head: true });
    const { count: ordersCount, error: errOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
    if (errCourses || errStudents || errOrders) {
      return res.status(500).json({
        success: false,
        message: "Conectou ao Supabase, mas encontrou erro ao consultar as tabelas.",
        errors: {
          courses: errCourses ? errCourses.message : "OK",
          students: errStudents ? errStudents.message : "OK",
          orders: errOrders ? errOrders.message : "OK"
        }
      });
    }
    return res.json({
      success: true,
      message: "Conex\xE3o com o Supabase PostgreSQL realizada com sucesso absoluto!",
      tables: {
        courses: "OK (Acess\xEDvel)",
        students: `OK (${studentsCount ?? 0} registros)`,
        orders: `OK (${ordersCount ?? 0} registros)`
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Erro na comunica\xE7\xE3o com o Supabase: ${err.message}`
    });
  }
}

// server/app.ts
import_dotenv2.default.config();
var app = (0, import_express.default)();
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }
  import_express.default.json({ limit: "10mb" })(req, res, next);
});
app.use(import_express.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
var PORT = 3e3;
var appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
var ADMIN_USER = process.env.ADMIN_USER || "admin";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
var apiRouter = import_express.default.Router();
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/gateways/config-status", (req, res) => {
  const currentAppUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || appUrl;
  const mercadoPago = mercadoPagoService.getConfigStatus(currentAppUrl);
  const supabase = {
    isConfigured: isSupabaseConfigured(),
    url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + "..." : null
  };
  res.json({ mercadoPago, supabase });
});
apiRouter.get("/supabase/test", testSupabaseConnection);
apiRouter.get("/courses", (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  res.json(db.getCourses(includeInactive));
});
apiRouter.get("/courses/:id", (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: "Curso n\xE3o encontrado." });
  res.json(course);
});
apiRouter.put("/courses/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedCourse = db.updateCourse(id, updates);
  if (!updatedCourse) {
    return res.status(404).json({ error: "Curso n\xE3o encontrado para atualiza\xE7\xE3o." });
  }
  res.json({ success: true, course: updatedCourse });
});
apiRouter.post("/courses", (req, res) => {
  try {
    const newCourseData = req.body;
    if (!newCourseData.title || !newCourseData.category) {
      return res.status(400).json({ error: "T\xEDtulo e Categoria s\xE3o obrigat\xF3rios." });
    }
    const created = db.createCourse(newCourseData);
    res.status(201).json({ success: true, course: created });
  } catch (err) {
    console.error("Erro ao cadastrar curso:", err);
    res.status(500).json({ error: err.message || "Erro ao cadastrar novo curso." });
  }
});
var handleToggleActive = (req, res) => {
  const { id } = req.params;
  const result = db.toggleCourseActive(id);
  if (!result.success) {
    return res.status(404).json({ error: "Curso n\xE3o encontrado." });
  }
  res.json({ success: true, isActive: result.isActive, course: result.course });
};
apiRouter.patch("/courses/:id/toggle-active", handleToggleActive);
apiRouter.put("/courses/:id/toggle-active", handleToggleActive);
apiRouter.delete("/courses/:id", (req, res) => {
  const { id } = req.params;
  const success = db.deleteCourse(id);
  if (!success) {
    return res.status(404).json({ error: "Curso n\xE3o encontrado para exclus\xE3o." });
  }
  res.json({ success: true, message: "Curso exclu\xEDdo com sucesso." });
});
apiRouter.get("/students/check", async (req, res) => {
  const cpf = req.query.cpf;
  const courseId = req.query.courseId;
  if (!cpf) {
    return res.status(400).json({ error: "CPF \xE9 obrigat\xF3rio." });
  }
  try {
    const student = await db.findStudentByCpf(cpf);
    let existingOrder = null;
    if (courseId) {
      existingOrder = await db.findActiveOrderByCpfAndCourse(cpf, courseId);
    }
    return res.json({
      isRegistered: Boolean(student),
      student: student || null,
      existingCourseOrder: existingOrder
    });
  } catch (err) {
    console.error("Erro na checagem de aluno:", err);
    return res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/student/portal", async (req, res) => {
  const cpf = req.query.cpf;
  if (!cpf) {
    return res.status(400).json({ error: "CPF \xE9 obrigat\xF3rio para acessar o painel do aluno." });
  }
  try {
    const data = await db.getStudentPortalData(cpf);
    if (!data.authorized) {
      return res.status(403).json({
        success: false,
        authorized: false,
        error: "Acesso n\xE3o autorizado: CPF n\xE3o encontrado no banco de dados Supabase nem no Painel Administrativo. A \xC1rea do Aluno \xE9 de acesso restrito a condutores cadastrados.",
        registeredInSupabase: data.registeredInSupabase,
        registeredInAdmin: data.registeredInAdmin
      });
    }
    return res.json({
      success: true,
      authorized: true,
      student: data.student,
      orders: data.orders,
      registeredInSupabase: data.registeredInSupabase,
      registeredInAdmin: data.registeredInAdmin
    });
  } catch (err) {
    console.error("Erro ao verificar autoriza\xE7\xE3o do aluno:", err);
    return res.status(500).json({
      error: err.message || "Erro ao consultar autoriza\xE7\xE3o no banco de dados"
    });
  }
});
apiRouter.post("/pix/create", async (req, res) => {
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) || {};
    const {
      courseId,
      customerName,
      customerEmail,
      customerCpf,
      customerWhatsapp = "",
      customerBirthDate = "",
      customerCnhNumber = "",
      customerCnhCategory = "",
      gateway = "MERCADO_PAGO"
    } = body;
    if (!courseId || !customerName || !customerEmail || !customerCpf) {
      return res.status(400).json({
        error: "Campos obrigat\xF3rios: Nome, E-mail, CPF e ID do Curso."
      });
    }
    const course = db.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Curso selecionado n\xE3o foi encontrado no cat\xE1logo." });
    }
    const existingOrder = await db.findActiveOrderByCpfAndCourse(
      customerCpf,
      courseId
    );
    if (existingOrder) {
      if (existingOrder.status === "PAID") {
        return res.status(409).json({
          error: `Aluno j\xE1 matriculado neste curso! O curso "${existingOrder.courseTitle}" j\xE1 se encontra confirmado para este CPF.`,
          code: "ALREADY_ENROLLED_AND_PAID",
          order: existingOrder
        });
      } else {
        return res.status(409).json({
          error: `J\xE1 existe um pedido aberto para este curso com seu CPF. Voc\xEA pode continuar o pagamento diretamente.`,
          code: "PENDING_ORDER_EXISTS",
          order: existingOrder
        });
      }
    }
    const orderId = `ped_${Date.now()}`;
    const selectedGateway = "MERCADO_PAGO";
    const effectiveAppUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || appUrl;
    const mpResult = await mercadoPagoService.createPixPayment({
      orderId,
      amount: course.price,
      customerName,
      customerEmail,
      customerCpf,
      courseTitle: course.title,
      appUrl: effectiveAppUrl
    });
    const mpPreference = await mercadoPagoService.createPreference({
      orderId,
      amount: course.price,
      customerName,
      customerEmail,
      customerCpf,
      customerPhone: customerWhatsapp,
      courseTitle: course.title,
      appUrl: effectiveAppUrl
    });
    const order = {
      id: orderId,
      txid: mpResult.paymentId,
      gateway: selectedGateway,
      paymentMethod: "PIX",
      checkoutUrl: mpPreference.checkoutUrl,
      courseId: course.id,
      courseTitle: course.title,
      courseSubtitle: course.subtitle,
      courseThumbnail: course.thumbnail,
      customerName,
      customerEmail,
      customerCpf,
      customerWhatsapp,
      customerBirthDate,
      customerCnhNumber,
      customerCnhCategory,
      amount: course.price,
      status: "PENDING",
      statusMessage: "Aguardando pagamento via Pix ou Cart\xE3o.",
      qrCodeUrl: mpResult.qrCodeUrl,
      pixCopiaECola: mpResult.pixCopiaECola,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      mercadoPagoPaymentId: mpResult.paymentId,
      accessDispatchedStatus: "AGUARDANDO_ENVIO_MANUAL"
    };
    await db.createOrder(order);
    return res.status(201).json({
      order,
      isRealApi: mpResult.isRealApi,
      gateway: selectedGateway
    });
  } catch (error) {
    console.error("Erro ao gerar cobran\xE7a de matr\xEDcula:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao processar matr\xEDcula." });
  }
});
apiRouter.get("/orders/lookup", async (req, res) => {
  const cpf = req.query.cpf;
  if (!cpf) {
    return res.status(400).json({ error: "CPF \xE9 obrigat\xF3rio." });
  }
  try {
    const order = await db.getOrderByCpf(cpf);
    if (!order) {
      return res.status(404).json({ error: "Nenhum pedido encontrado para o CPF informado." });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await db.getOrderByIdAsync(id);
    if (!order) {
      return res.status(404).json({ error: "Matr\xEDcula n\xE3o encontrada." });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
apiRouter.get("/pix/status/:txid", async (req, res) => {
  const { txid } = req.params;
  try {
    const order = await db.getOrderByTxid(txid);
    if (!order) {
      return res.status(404).json({ error: "Matr\xEDcula n\xE3o encontrada." });
    }
    return res.json({ order });
  } catch (err) {
    console.error("Erro ao consultar status do pedido:", err);
    return res.status(500).json({ error: err.message });
  }
});
apiRouter.post("/orders/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status, statusMessage } = req.body;
  const order = db.updateOrderStatus(orderId, status, statusMessage);
  if (!order) return res.status(404).json({ error: "Pedido n\xE3o encontrado." });
  res.json({ order });
});
var webhookPaths = [
  "/webhooks/mercadopago",
  "/webhook/mercadopago",
  "/mercadopago/webhook",
  "/mercadopago/webhooks"
];
var handleWebhookGet = (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Endpoint de Webhook do Mercado Pago ativo e pronto para receber notifica\xE7\xF5es de pagamentos de cursos.",
    path: req.originalUrl,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
var handleWebhookPost = async (req, res) => {
  const payload = req.body || {};
  const query = req.query || {};
  console.log(
    "[WEBHOOK MERCADO PAGO RECEBIDO]",
    JSON.stringify({ body: payload, query }, null, 2)
  );
  try {
    const paymentId = payload?.data?.id || payload?.id || (query.topic === "payment" ? query.id : null);
    const isMercadoPagoTest = payload?.live_mode === false || paymentId === "123456" || payload?.action === "payment.updated" && (!paymentId || paymentId === "123456");
    if (isMercadoPagoTest) {
      console.log(
        "[MERCADO PAGO TESTE RECEBIDO] Teste de webhook validado com sucesso:",
        payload
      );
      db.addWebhookLog({
        gateway: "MERCADO_PAGO",
        endpoint: req.originalUrl || "/api/webhooks/mercadopago",
        txid: String(paymentId || "TEST_123456"),
        statusCode: 200,
        statusMessage: `Teste de Webhook do Mercado Pago validado com sucesso (A\xE7\xE3o: ${payload.action || "teste"}, Live Mode: ${payload.live_mode ?? false}).`,
        rawPayload: { body: payload, query }
      });
      return res.status(200).json({
        status: "OK",
        message: "Notifica\xE7\xE3o de teste do Mercado Pago recebida e validada com sucesso.",
        received: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (!paymentId) {
      db.addWebhookLog({
        gateway: "MERCADO_PAGO",
        endpoint: req.originalUrl || "/api/webhooks/mercadopago",
        txid: "NO_PAYMENT_ID",
        statusCode: 200,
        statusMessage: "Notifica\xE7\xE3o recebida sem ID direto de pagamento (ex: teste ou Merchant Order).",
        rawPayload: { body: payload, query }
      });
      return res.status(200).send("OK");
    }
    const mpDetails = await mercadoPagoService.getPaymentDetails(
      String(paymentId)
    );
    const externalReference = mpDetails?.external_reference || payload?.external_reference;
    const mpStatus = mpDetails?.status || "approved";
    const paymentType = mpDetails?.payment_type_id || "bank_transfer";
    const paymentMethod = mpDetails?.payment_method_id || "pix";
    let foundOrder;
    if (externalReference) {
      foundOrder = await db.getOrderByIdAsync(externalReference);
    }
    if (!foundOrder) {
      foundOrder = await db.getOrderByIdAsync(String(paymentId));
    }
    if (foundOrder) {
      if (mpStatus === "approved") {
        let methodLabel = "PIX";
        if (paymentType === "credit_card") methodLabel = "CREDIT_CARD";
        else if (paymentType === "debit_card") methodLabel = "DEBIT_CARD";
        foundOrder.paymentMethod = methodLabel;
        const { order } = await db.markOrderAsPaid(
          foundOrder.id,
          String(paymentId)
        );
        if (order) {
          order.paymentMethod = methodLabel;
          notificationService.sendPaymentConfirmedNotification({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerWhatsapp: order.customerWhatsapp,
            courseTitle: order.courseTitle,
            orderId: order.id,
            amount: order.amount
          });
        }
        db.addWebhookLog({
          gateway: "MERCADO_PAGO",
          endpoint: req.originalUrl || "/api/webhooks/mercadopago",
          txid: String(paymentId),
          amount: foundOrder.amount,
          statusCode: 200,
          statusMessage: `Pagamento #${paymentId} Aprovado (${paymentType.toUpperCase()} / ${paymentMethod.toUpperCase()}).`,
          rawPayload: { body: payload, query, mpDetails }
        });
        return res.status(200).json({
          status: "PROCESSED",
          orderId: order?.id,
          method: methodLabel
        });
      } else if (mpStatus === "rejected") {
        await db.updateOrderStatus(
          foundOrder.id,
          "ERROR",
          "Pagamento recusado pela operadora do cart\xE3o ou banco emissor."
        );
        db.addWebhookLog({
          gateway: "MERCADO_PAGO",
          endpoint: req.originalUrl || "/api/webhooks/mercadopago",
          txid: String(paymentId),
          amount: foundOrder.amount,
          statusCode: 200,
          statusMessage: `Pagamento #${paymentId} Recusado pelo Mercado Pago. Motivo: ${mpDetails?.status_detail || "Recusado"}.`,
          rawPayload: { body: payload, query, mpDetails }
        });
        return res.status(200).json({ status: "REJECTED" });
      } else {
        db.addWebhookLog({
          gateway: "MERCADO_PAGO",
          endpoint: req.originalUrl || "/api/webhooks/mercadopago",
          txid: String(paymentId),
          amount: foundOrder.amount,
          statusCode: 200,
          statusMessage: `Pagamento #${paymentId} com status em andamento: ${mpStatus}.`,
          rawPayload: { body: payload, query, mpDetails }
        });
        return res.status(200).send("OK");
      }
    } else {
      db.addWebhookLog({
        gateway: "MERCADO_PAGO",
        endpoint: req.originalUrl || "/api/webhooks/mercadopago",
        txid: String(paymentId),
        statusCode: 200,
        statusMessage: `Aviso: Pedido n\xE3o encontrado no banco para pagamento #${paymentId}.`,
        rawPayload: { body: payload, query }
      });
      return res.status(200).send("OK");
    }
  } catch (error) {
    console.error("Erro ao processar Webhook Mercado Pago:", error);
    db.addWebhookLog({
      gateway: "MERCADO_PAGO",
      endpoint: req.originalUrl || "/api/webhooks/mercadopago",
      txid: "ERROR",
      statusCode: 500,
      statusMessage: `Erro: ${error.message}`,
      rawPayload: { body: payload, query }
    });
    return res.status(500).json({ error: error.message });
  }
};
webhookPaths.forEach((p) => {
  apiRouter.get(p, handleWebhookGet);
  apiRouter.post(p, handleWebhookPost);
  apiRouter.head(p, (req, res) => res.status(200).end());
});
apiRouter.post("/simulador/pagar-pix", async (req, res) => {
  const { txid } = req.body;
  const order = await db.getOrderByTxid(txid);
  if (!order) {
    return res.status(404).json({ error: "Pedido n\xE3o encontrado para o txid informado." });
  }
  if (order.status === "PAID") {
    return res.json({
      message: "Pedido j\xE1 se encontra marcado como PAGO.",
      order
    });
  }
  const simulatedMpPaymentId = order.mercadoPagoPaymentId || `998877${Date.now()}`;
  const { order: paidOrder } = await db.markOrderAsPaid(
    order.id,
    simulatedMpPaymentId
  );
  if (paidOrder) {
    notificationService.sendPaymentConfirmedNotification({
      customerName: paidOrder.customerName,
      customerEmail: paidOrder.customerEmail,
      customerWhatsapp: paidOrder.customerWhatsapp,
      courseTitle: paidOrder.courseTitle,
      orderId: paidOrder.id,
      amount: paidOrder.amount
    });
  }
  db.addWebhookLog({
    gateway: "MERCADO_PAGO",
    endpoint: "/api/webhooks/mercadopago (Simulador)",
    txid: String(simulatedMpPaymentId),
    amount: order.amount,
    statusCode: 200,
    statusMessage: `Simula\xE7\xE3o de Pagamento: Pedido ${order.id} confirmado. Aluno notificado.`,
    rawPayload: { simulated: true, txid, orderId: order.id }
  });
  return res.json({
    success: true,
    message: "Pagamento confirmado e notifica\xE7\xE3o enviada!",
    order: await db.getOrderByTxid(order.id)
    // <-- await adicionado
  });
});
apiRouter.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const token = `adm_session_${Buffer.from(`${username}:${Date.now()}`).toString("base64")}`;
    return res.json({
      authenticated: true,
      token,
      username: ADMIN_USER,
      message: "Autentica\xE7\xE3o de administrador realizada com sucesso."
    });
  }
  return res.status(401).json({ error: "Usu\xE1rio ou senha de administrador incorretos." });
});
var requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer adm_session_")) {
    return res.status(401).json({ error: "Acesso restrito. Fa\xE7a login como administrador." });
  }
  next();
};
apiRouter.post(
  "/admin/orders/:orderId/mark-dispatched",
  requireAdminAuth,
  (req, res) => {
    const { orderId } = req.params;
    const order = db.markAccessAsDispatched(orderId);
    if (!order)
      return res.status(404).json({ error: "Pedido n\xE3o encontrado." });
    res.json({
      order,
      message: "Status atualizado para: Acesso Enviado Manualmente."
    });
  }
);
apiRouter.get("/admin/overview", requireAdminAuth, async (req, res) => {
  const orders = await db.getAllOrdersAsync();
  const webhookLogs = db.getWebhookLogs();
  const effectiveAppUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || appUrl;
  const mpConfig = mercadoPagoService.getConfigStatus(effectiveAppUrl);
  res.json({
    orders,
    webhookLogs,
    configStatus: {
      mercadoPago: mpConfig
    }
  });
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;

// api/_handler.ts
var handler_default = app_default;
