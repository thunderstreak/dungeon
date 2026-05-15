// 商店面板 - 商品列表、购买、价格显示

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import { gameState } from '@/state/GameState';
import { type ShopItem } from '@/data/npcs';
import { getPotionById, getMaterialById } from '@/data/items';
import type { Item } from '@/config/types';
import { spendGold, addItem } from '@/systems/InventorySystem';
import { createShopState, getItemPrice, canBuyItem, getRemainingLimit, type ShopState, type ShopItemState } from '@/systems/ShopSystem';
import { showNotification } from '@/ui/NotificationToast';

/** 从物品ID获取Item对象 */
function getItemById(id: string): Item | null {
  const potion = getPotionById(id);
  if (potion) {
    return {
      id: potion.id,
      name: potion.name,
      type: potion.type,
      icon: potion.icon,
      description: potion.description,
      isStackable: potion.isStackable,
      maxStack: potion.maxStack,
    };
  }
  const mat = getMaterialById(id);
  if (mat) {
    return {
      id: mat.id,
      name: mat.name,
      type: mat.type,
      icon: mat.icon,
      description: mat.description,
      isStackable: mat.isStackable,
      maxStack: mat.maxStack,
    };
  }
  return null;
}

const CATEGORY_NAMES: Record<string, string> = {
  potion: '药水',
  scroll: '卷轴',
  material: '材料',
  other: '其他',
};

const RARITY_COLORS: Record<string, string> = {
  white: '#cccccc',
  blue: '#5599ff',
  purple: '#bb66ff',
  pink: '#ff66aa',
  orange: '#ffaa00',
};

export class ShopPanel extends BasePanel {
  private goldText!: Phaser.GameObjects.Text;
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;
  private shopState: ShopState;
  private itemElements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.shopState = createShopState();
    this.createContent();
  }

  private createContent(): void {
    const panelW = 420;
    const panelH = 380;
    const px = CANVAS_WIDTH / 2 - panelW / 2;
    const py = CANVAS_HEIGHT / 2 - panelH / 2;

    // 背景
    const bg = this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    // 标题
    const title = this.scene.add.text(CANVAS_WIDTH / 2, py + 18, '商店', {
      fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 金币
    this.goldText = this.scene.add.text(CANVAS_WIDTH / 2, py + 40, '', {
      fontSize: '12px', color: '#ffdd44',
    }).setOrigin(0.5);
    this.container.add(this.goldText);

    // 滚动区域容器
    this.scrollContainer = this.scene.add.container(0, 0);
    this.container.add(this.scrollContainer);

    // 裁剪蒙版
    const maskGfx = this.scene.make.graphics({});
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(px + 5, py + 52, panelW - 10, panelH - 62);
    this.scrollContainer.setMask(maskGfx.createGeometryMask());

    // 滚动事件
    this.scene.input.on('wheel', (_p: Phaser.Input.Pointer, _g: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.isOpen) return;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll);
      this.scrollContainer.y = -this.scrollY;
    });

    // 关闭按钮（必须最后添加，确保在最顶层接收点击）
    const closeBtn = this.scene.add.text(px + panelW - 20, py + 10, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.container.add(closeBtn);
  }

  show(): void {
    super.show();
    this.refreshItems();
  }

  /** 刷新商品列表 */
  private refreshItems(): void {
    // 清除旧元素
    for (const el of this.itemElements) {
      el.destroy();
    }
    this.itemElements = [];
    this.scrollY = 0;
    this.scrollContainer.y = 0;
    this.scrollContainer.removeAll(false);

    const character = gameState.getCharacter();
    this.goldText.setText(`金币: ${character.gold}`);

    const panelW = 420;
    const px = CANVAS_WIDTH / 2 - panelW / 2;
    const itemH = 36;
    const padding = 4;

    // 按分类分组
    const grouped = new Map<string, ShopItemState[]>();
    for (const itemState of this.shopState.items) {
      const cat = itemState.item.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(itemState);
    }

    let y = padding;

    for (const [category, items] of grouped) {
      // 分类标题
      const catLabel = this.scene.add.text(10, y, `【${CATEGORY_NAMES[category] ?? category}】`, {
        fontSize: '12px', color: '#888899', fontStyle: 'bold',
      });
      this.scrollContainer.add(catLabel);
      this.itemElements.push(catLabel);
      y += itemH;

      for (const itemState of items) {
        this.renderShopItem(itemState, y, px, itemH);
        y += itemH;
      }

      y += 4; // 分类间距
    }

    this.maxScroll = Math.max(0, y - (380 - 62));
  }

  /** 渲染单个商品行 */
  private renderShopItem(itemState: ShopItemState, y: number, px: number, itemH: number): void {
    const shopItem = itemState.item;
    const character = gameState.getCharacter();
    const price = getItemPrice(itemState);
    const remaining = getRemainingLimit(itemState);
    const validation = canBuyItem(itemState, character.level, character.gold);
    const itemDef = getItemById(shopItem.itemId);

    // 行背景（可悬停）
    const rowBg = this.scene.add.rectangle(px + 210, y + itemH / 2, 400, itemH - 2, 0x222233, 0.5);
    rowBg.setOrigin(0.5, 0.5);
    this.scrollContainer.add(rowBg);
    this.itemElements.push(rowBg);

    // 物品名称
    const rarityColor = itemDef ? (RARITY_COLORS[(itemDef as any).rarity] ?? '#cccccc') : '#cccccc';
    const nameText = this.scene.add.text(px + 15, y + itemH / 2, itemDef?.name ?? shopItem.itemId, {
      fontSize: '12px', color: rarityColor,
    }).setOrigin(0, 0.5);
    this.scrollContainer.add(nameText);
    this.itemElements.push(nameText);

    // 稀有标记
    if (itemState.isRare) {
      const rareTag = this.scene.add.text(px + 15 + nameText.width + 6, y + itemH / 2, '[稀有]', {
        fontSize: '10px', color: '#ffaa00',
      }).setOrigin(0, 0.5);
      this.scrollContainer.add(rareTag);
      this.itemElements.push(rareTag);
    }

    // 价格
    const priceColor = validation.canBuy ? '#ffdd44' : '#886633';
    const priceText = this.scene.add.text(px + 250, y + itemH / 2, `${price}G`, {
      fontSize: '12px', color: priceColor,
    }).setOrigin(0.5, 0.5);
    this.scrollContainer.add(priceText);
    this.itemElements.push(priceText);

    // 限购信息
    if (shopItem.dailyLimit > 0) {
      const limitText = this.scene.add.text(px + 310, y + itemH / 2, `剩${remaining}`, {
        fontSize: '10px', color: remaining > 0 ? '#88aa88' : '#884444',
      }).setOrigin(0.5, 0.5);
      this.scrollContainer.add(limitText);
      this.itemElements.push(limitText);
    }

    // 购买按钮
    const canBuyNow = validation.canBuy && (remaining > 0 || shopItem.dailyLimit === 0);
    const btnColor = canBuyNow ? 0x336633 : 0x333333;
    const btnStroke = canBuyNow ? 0x55aa55 : 0x555555;
    const buyBtn = this.scene.add.rectangle(px + 385, y + itemH / 2, 50, 22, btnColor)
      .setStrokeStyle(1, btnStroke)
      .setOrigin(0.5, 0.5);
    this.scrollContainer.add(buyBtn);
    this.itemElements.push(buyBtn);

    const buyLabel = this.scene.add.text(px + 385, y + itemH / 2, '购买', {
      fontSize: '11px', color: canBuyNow ? '#ffffff' : '#666666',
    }).setOrigin(0.5, 0.5);
    this.scrollContainer.add(buyLabel);
    this.itemElements.push(buyLabel);

    if (canBuyNow) {
      buyBtn.setInteractive({ useHandCursor: true });
      buyBtn.on('pointerover', () => {
        buyBtn.setFillStyle(0x448844);
        buyLabel.setColor('#ffffff');
      });
      buyBtn.on('pointerout', () => {
        buyBtn.setFillStyle(0x336633);
        buyLabel.setColor('#ffffff');
      });
      buyBtn.on('pointerdown', () => {
        this.executeBuy(itemState);
      });
    }

    // 整行悬停高亮 + Tooltip
    rowBg.setInteractive({ useHandCursor: canBuyNow });
    rowBg.on('pointerover', () => {
      rowBg.setFillStyle(0x333344, 0.7);
      if (itemDef) {
        const tooltip = (this.scene as any).tooltip;
        tooltip?.showText(
          this.buildItemTooltip(itemDef, price, shopItem),
          CANVAS_WIDTH / 2 + 210 + 10,
          y + itemH / 2 - this.scrollY + (CANVAS_HEIGHT / 2 - 190),
        );
      }
    });
    rowBg.on('pointerout', () => {
      rowBg.setFillStyle(0x222233, 0.5);
      const tooltip = (this.scene as any).tooltip;
      tooltip?.hide();
    });
  }

  private buildItemTooltip(item: Item, price: number, shopItem: ShopItem): string {
    const lines: string[] = [];
    lines.push(item.name);
    lines.push(`价格: ${price} 金币`);
    lines.push(item.description);
    if (shopItem.dailyLimit > 0) lines.push(`每日限购: ${shopItem.dailyLimit}`);
    return lines.join('\n');
  }

  /** 执行购买 */
  private executeBuy(itemState: ShopItemState): void {
    const character = gameState.getCharacter();
    const price = getItemPrice(itemState);

    // 验证
    const validation = canBuyItem(itemState, character.level, character.gold);
    if (!validation.canBuy) {
      showNotification(this.scene, validation.error!, '#ff4444');
      return;
    }

    // 获取物品定义
    const itemDef = getItemById(itemState.item.itemId);
    if (!itemDef) {
      showNotification(this.scene, '物品数据异常', '#ff4444');
      return;
    }

    // 扣金币
    if (!spendGold(character, price)) {
      showNotification(this.scene, '金币不足', '#ff4444');
      return;
    }

    // 添加物品到背包
    const added = addItem(character, itemDef, 1);
    if (added <= 0) {
      // 背包满了，退还金币
      character.gold += price;
      character.inventory.gold = character.gold;
      showNotification(this.scene, '背包已满!', '#ff4444');
      return;
    }

    // 更新商店状态
    itemState.boughtToday++;

    // 刷新显示
    this.goldText.setText(`金币: ${character.gold}`);
    this.refreshItems();

    const name = itemDef.name;
    showNotification(this.scene, `购买成功: ${name}`, '#44ff44');
  }

  destroy(): void {
    super.destroy();
  }
}
