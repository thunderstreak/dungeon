// UIScene - 独立UI层，覆盖在游戏场景之上

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { gameState } from '@/state/GameState';
import { Hud } from '@/ui/Hud';
import { BuffBar } from '@/ui/BuffBar';
import { MiniMap } from '@/ui/MiniMap';
import { InventoryPanel } from '@/ui/InventoryPanel';
import { EquipmentPanel } from '@/ui/EquipmentPanel';
import { ShopPanel } from '@/ui/ShopPanel';
import { EnhancePanel } from '@/ui/EnhancePanel';
import { RepairPanel } from '@/ui/RepairPanel';
import { DecomposePanel } from '@/ui/DecomposePanel';
import { CraftPanel } from '@/ui/CraftPanel';
import { IdentifyPanel } from '@/ui/IdentifyPanel';
import { WarehousePanel } from '@/ui/WarehousePanel';
import { SaveSlotPanel } from '@/ui/SaveSlotPanel';
import { DeathPanel } from '@/ui/DeathPanel';
import { AbyssChoicePanel } from '@/ui/AbyssChoicePanel';
import { SkillBar } from '@/ui/SkillBar';
import { HotBar } from '@/ui/HotBar';
import { CharacterPanel } from '@/ui/CharacterPanel';
import { SkillPanel } from '@/ui/SkillPanel';
import { DialogBox } from '@/ui/DialogBox';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Tooltip } from '@/ui/Tooltip';
import { SettingsPanel } from '@/ui/SettingsPanel';
import { updateCooldowns } from '@/systems/SkillSystem';
import { usePotion } from '@/systems/ItemSystem';
import { Monster } from '@/entities/Monster';
import { Boss } from '@/entities/Boss';
import type { DungeonScene } from './DungeonScene';
import type { NPCData } from '@/config/types';

export class UIScene extends Phaser.Scene {
  hud!: Hud;
  buffBar!: BuffBar;
  miniMap!: MiniMap;
  inventoryPanel!: InventoryPanel;
  equipmentPanel!: EquipmentPanel;
  shopPanel!: ShopPanel;
  enhancePanel!: EnhancePanel;
  repairPanel!: RepairPanel;
  decomposePanel!: DecomposePanel;
  craftPanel!: CraftPanel;
  identifyPanel!: IdentifyPanel;
  warehousePanel!: WarehousePanel;
  saveSlotPanel!: SaveSlotPanel;
  deathPanel!: DeathPanel;
  abyssChoicePanel!: AbyssChoicePanel;
  skillBar!: SkillBar;
  hotBar!: HotBar;
  characterPanel!: CharacterPanel;
  skillPanel!: SkillPanel;
  dialogBox!: DialogBox;
  confirmDialog!: ConfirmDialog;
  tooltip!: Tooltip;
  settingsPanel!: SettingsPanel;

  // 选中怪物信息显示
  private monsterInfoContainer!: Phaser.GameObjects.Container;
  private monsterInfoName!: Phaser.GameObjects.Text;
  private monsterInfoLevel!: Phaser.GameObjects.Text;
  private monsterInfoHpBarBg!: Phaser.GameObjects.Rectangle;
  private monsterInfoHpBarFill!: Phaser.GameObjects.Rectangle;
  private monsterInfoHpText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // HUD始终显示
    this.hud = new Hud(this);

    // Buff栏
    this.buffBar = new BuffBar(this);

    // 小地图（地牢中显示）
    this.miniMap = new MiniMap(this);

    // 各面板（按需打开）
    this.inventoryPanel = new InventoryPanel(this);
    this.equipmentPanel = new EquipmentPanel(this);
    this.shopPanel = new ShopPanel(this);
    this.enhancePanel = new EnhancePanel(this);
    this.repairPanel = new RepairPanel(this);
    this.decomposePanel = new DecomposePanel(this);
    this.craftPanel = new CraftPanel(this);
    this.identifyPanel = new IdentifyPanel(this);
    this.warehousePanel = new WarehousePanel(this);
    this.saveSlotPanel = new SaveSlotPanel(this);
    this.deathPanel = new DeathPanel(this);
    this.abyssChoicePanel = new AbyssChoicePanel(this);

    // 技能栏和物品快捷栏
    this.skillBar = new SkillBar(this);
    this.hotBar = new HotBar(this);

    // 角色面板
    this.characterPanel = new CharacterPanel(this);

    // 技能面板
    this.skillPanel = new SkillPanel(this);

    // 设置面板
    this.settingsPanel = new SettingsPanel(this);

    // NPC对话框
    this.dialogBox = new DialogBox(this);

    // 确认对话框
    this.confirmDialog = new ConfirmDialog(this);

    // 提示框
    this.tooltip = new Tooltip(this);

    // 选中怪物信息（顶部居中）
    this.createMonsterInfo();

    // NPC对话选项 → 打开对应面板
    this.events.on('npc:action', (action: string) => {
      this.openPanelByAction(action);
    });

    // 键盘快捷键
    this.setupHotkeys();
  }

  private setupHotkeys(): void {
    if (!this.input.keyboard) return;

    // B - 背包
    this.input.keyboard.on('keydown-B', () => this.inventoryPanel.toggle());
    // E - 装备
    this.input.keyboard.on('keydown-E', () => this.equipmentPanel.toggle());
    // I - 背包（兼容设计文档）
    this.input.keyboard.on('keydown-I', () => this.inventoryPanel.toggle());
    // C - 角色面板
    this.input.keyboard.on('keydown-C', () => this.characterPanel.toggle());
    // K - 技能面板
    this.input.keyboard.on('keydown-K', () => this.skillPanel.toggle());
    // ESC - 设置面板 / 关闭面板
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.settingsPanel.isOpen) {
        this.settingsPanel.hide();
      } else if (this.isAnyPanelOpen()) {
        this.closeAllPanels();
      } else {
        this.settingsPanel.show();
      }
    });

    // 1-8 技能快捷键
    const skillKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
    skillKeys.forEach((key, index) => {
      this.input.keyboard!.on(`keydown-${key}`, () => this.handleSkillKey(index));
    });

    // 9-0/-/= 物品快捷键
    const itemKeys = ['NINE', 'ZERO', 'MINUS', 'EQUALS'];
    itemKeys.forEach((key, index) => {
      this.input.keyboard!.on(`keydown-${key}`, () => this.handleItemKey(index));
    });
  }

  /** 处理技能快捷键 */
  private handleSkillKey(index: number): void {
    const character = gameState.getCharacter();
    if (!character || this.isAnyPanelOpen()) return;

    const skillSlot = character.skills[index];
    if (!skillSlot) return;

    // 获取游戏场景
    const gameScene = this.scene.get('DungeonScene') as DungeonScene | null;
    if (!gameScene) return;

    const player = (gameScene as unknown as { player: import('@/entities/Player').Player }).player;
    if (!player) return;

    const target = player.attackTarget;
    if (!target || target.isDead) return;

    // 通过DungeonScene处理（区分弹道/瞬发）
    (gameScene as any).castSkillOnTarget(skillSlot, target);
  }

  /** 处理物品快捷键 */
  private handleItemKey(index: number): void {
    const character = gameState.getCharacter();
    if (!character || this.isAnyPanelOpen()) return;

    // 从消耗品分类获取物品
    const consumables = character.inventory.categories.consumable;
    const slot = consumables[index];
    if (!slot?.item) return;

    const gameScene = this.scene.get('DungeonScene') as DungeonScene | null;
    if (!gameScene) return;

    const player = (gameScene as unknown as { player: import('@/entities/Player').Player }).player;
    if (!player) return;

    usePotion(character, slot.item.id, player.combatEntity, Date.now());
    player.syncHp();
    player.updateHpBar();
  }

  /** 显示NPC对话框 */
  showDialog(npcData: NPCData): void {
    if (!this.dialogBox.isOpen) {
      this.dialogBox.show(npcData);
    }
  }

  /** 显示确认对话框 */
  showConfirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.confirmDialog.show(message, onConfirm, onCancel);
  }

  /** 关闭所有面板 */
  closeAllPanels(): void {
    this.dialogBox.hide();
    this.inventoryPanel.hide();
    this.equipmentPanel.hide();
    this.shopPanel.hide();
    this.enhancePanel.hide();
    this.repairPanel.hide();
    this.decomposePanel.hide();
    this.craftPanel.hide();
    this.identifyPanel.hide();
    this.warehousePanel.hide();
    this.saveSlotPanel.hide();
    this.characterPanel.hide();
    this.skillPanel.hide();
    this.settingsPanel.hide();
  }

  /** 任意面板是否打开 */
  isAnyPanelOpen(): boolean {
    return this.dialogBox.isOpen ||
      this.inventoryPanel.isOpen || this.equipmentPanel.isOpen ||
      this.shopPanel.isOpen || this.enhancePanel.isOpen ||
      this.repairPanel.isOpen || this.decomposePanel.isOpen ||
      this.craftPanel.isOpen || this.identifyPanel.isOpen ||
      this.warehousePanel.isOpen || this.saveSlotPanel.isOpen ||
      this.characterPanel.isOpen || this.skillPanel.isOpen ||
      this.settingsPanel.isOpen;
  }

  /** 根据NPC action打开对应面板 */
  openPanelByAction(action: string): void {
    this.closeAllPanels();
    switch (action) {
      case 'open_enhance': this.enhancePanel.show(); break;
      case 'open_repair': this.repairPanel.show(); break;
      case 'open_disenchant': this.decomposePanel.show(); break;
      case 'open_shop_buy':
      case 'open_shop_sell': this.shopPanel.show(); break;
      case 'open_bank': this.warehousePanel.show(); break;
      case 'open_identify': this.identifyPanel.show(); break;
      case 'open_recipes':
      case 'open_rune_craft': this.craftPanel.show(); break;
    }
  }

  /** 显示死亡面板 */
  showDeathPenalty(expLoss: number, goldLoss: number, itemsLost: number, onReturnTown: () => void): void {
    this.deathPanel.onReturnTown = onReturnTown;
    this.deathPanel.showWithPenalty(expLoss, goldLoss);
    if (itemsLost > 0) {
      // 在面板上追加丢物品提示
      this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, `丢失了${itemsLost}件物品`, {
        fontSize: '12px', color: '#ffaa44',
      }).setOrigin(0.5).setDepth(4000);
    }
  }

  /** 显示深渊选择面板 */
  showAbyssChoice(onChooseAbyss: () => void, onChooseNormal: () => void): void {
    this.abyssChoicePanel.onChooseAbyss = onChooseAbyss;
    this.abyssChoicePanel.onChooseNormal = onChooseNormal;
    this.abyssChoicePanel.show();
  }

  update(_time: number, delta: number): void {
    const character = gameState.getCharacter();
    if (character) {
      // 更新技能冷却
      updateCooldowns(character, delta / 1000);

      this.hud.update(character);
      this.skillBar.update(character.skills);
      this.hotBar.update(character.inventory.categories.consumable);
    }

    // 更新Buff栏
    this.updateBuffBar();

    // 更新小地图
    this.updateMiniMap();

    // 更新选中怪物信息
    this.updateMonsterInfo();
  }

  private updateBuffBar(): void {
    // 从当前活跃的游戏场景获取玩家buff
    const townScene = this.scene.get('TownScene') as import('./TownScene').TownScene | null;
    if (townScene && this.scene.isActive('TownScene')) {
      const player = (townScene as any).player;
      if (player?.combatEntity) {
        this.buffBar.update(player.combatEntity.buffManager.getActiveBuffs());
      }
      return;
    }
    const dungeonScene = this.scene.get('DungeonScene') as DungeonScene | null;
    if (dungeonScene && this.scene.isActive('DungeonScene')) {
      const player = (dungeonScene as any).player;
      if (player?.combatEntity) {
        this.buffBar.update(player.combatEntity.buffManager.getActiveBuffs());
      }
    }
  }

  private updateMiniMap(): void {
    // 检查城镇场景
    const townScene = this.scene.get('TownScene') as import('./TownScene').TownScene | null;
    if (townScene && this.scene.isActive('TownScene')) {
      const data = (townScene as any).getMinimapData?.();
      if (data) {
        this.miniMap.updateTown(data.gridW, data.gridH, data.playerGrid, data.npcs, data.dungeonEntrance);
      }
      return;
    }

    // 检查地牢场景
    const dungeonScene = this.scene.get('DungeonScene') as DungeonScene | null;
    if (dungeonScene && this.scene.isActive('DungeonScene')) {
      const data = (dungeonScene as any).getMinimapData?.();
      if (data) {
        this.miniMap.updateDungeon(data.rooms, data.playerGrid, data.monsters);
      }
    }
  }

  /** 创建选中怪物信息显示 */
  private createMonsterInfo(): void {
    this.monsterInfoContainer = this.add.container(CANVAS_WIDTH / 2, 20);
    this.monsterInfoContainer.setDepth(3500);
    this.monsterInfoContainer.setScrollFactor(0);
    this.monsterInfoContainer.setVisible(false);

    // 背景
    const bg = this.add.rectangle(0, 0, 220, 36, 0x0a0a18, 0.85);
    bg.setStrokeStyle(1, 0x555577);
    this.monsterInfoContainer.add(bg);

    // 怪物名
    this.monsterInfoName = this.add.text(0, -10, '', {
      fontSize: '12px', color: '#ff8888', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.monsterInfoContainer.add(this.monsterInfoName);

    // 等级
    this.monsterInfoLevel = this.add.text(-95, -10, '', {
      fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0, 0.5);
    this.monsterInfoContainer.add(this.monsterInfoLevel);

    // HP条背景
    this.monsterInfoHpBarBg = this.add.rectangle(0, 6, 200, 6, 0x333333);
    this.monsterInfoContainer.add(this.monsterInfoHpBarBg);

    // HP条填充
    this.monsterInfoHpBarFill = this.add.rectangle(-100, 6, 200, 6, 0xdd3333);
    this.monsterInfoHpBarFill.setOrigin(0, 0.5);
    this.monsterInfoContainer.add(this.monsterInfoHpBarFill);

    // HP数值
    this.monsterInfoHpText = this.add.text(0, 6, '', {
      fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5);
    this.monsterInfoContainer.add(this.monsterInfoHpText);
  }

  /** 更新选中怪物信息 */
  private updateMonsterInfo(): void {
    // 从地牢场景获取玩家选中的目标
    const dungeonScene = this.scene.get('DungeonScene') as DungeonScene | null;
    if (!dungeonScene || !this.scene.isActive('DungeonScene')) {
      this.monsterInfoContainer.setVisible(false);
      return;
    }

    const player = (dungeonScene as any).player;
    const target = player?.attackTarget;

    if (!target || target.isDead) {
      this.monsterInfoContainer.setVisible(false);
      return;
    }

    this.monsterInfoContainer.setVisible(true);

    // 名称
    const name = target instanceof Monster ? target.monsterData.name : target.bossData.name;
    this.monsterInfoName.setText(`★ ${name} ★`);

    // 等级（显示所在层数）
    const floor = target instanceof Monster ? target.monsterData.floor : target.bossData.floor;
    this.monsterInfoLevel.setText(`F${floor}`);

    // HP
    const hp = target.combatEntity.hp;
    const maxHp = target.combatEntity.maxHp;
    const ratio = Math.max(0, hp / maxHp);
    this.monsterInfoHpBarFill.displayWidth = 200 * ratio;
    this.monsterInfoHpText.setText(`${Math.ceil(hp)} / ${maxHp}`);
  }

  destroy(): void {
    this.hud?.destroy();
    this.buffBar?.destroy();
    this.miniMap?.destroy();
    this.inventoryPanel?.destroy();
    this.equipmentPanel?.destroy();
    this.shopPanel?.destroy();
    this.enhancePanel?.destroy();
    this.repairPanel?.destroy();
    this.decomposePanel?.destroy();
    this.craftPanel?.destroy();
    this.identifyPanel?.destroy();
    this.warehousePanel?.destroy();
    this.saveSlotPanel?.destroy();
    this.deathPanel?.destroy();
    this.abyssChoicePanel?.destroy();
    this.skillBar?.destroy();
    this.hotBar?.destroy();
    this.characterPanel?.destroy();
    this.skillPanel?.destroy();
    this.settingsPanel?.destroy();
    this.dialogBox?.destroy();
    this.confirmDialog?.destroy();
    this.tooltip?.destroy();
  }
}
